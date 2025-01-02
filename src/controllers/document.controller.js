const Document = require('../models/document.model');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

exports.uploadDocument = async (req, res) => {
    try {
        console.log('Recebendo upload:', {
            files: req.files,
            body: req.body,
            params: req.params
        });

        if (!req.files || !req.files.document) {
            console.log('Nenhum arquivo recebido:', req.files);
            return res.status(400).json({
                success: false,
                message: 'Nenhum arquivo foi enviado'
            });
        }

        const file = req.files.document;
        const documentType = req.body.documentType;
        const leadId = req.params.id;

        console.log('Processando arquivo:', {
            name: file.name,
            type: file.mimetype,
            size: file.size,
            documentType,
            leadId
        });

        // Criar diretório para o lead se não existir
        const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'documents', leadId);
        await fs.mkdir(uploadDir, { recursive: true });

        // Gerar nome único para o arquivo
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadDir, fileName);

        // Mover o arquivo
        await file.mv(filePath);

        // Criar documento no banco
        const document = new Document({
            name: fileName,
            originalName: file.name,
            type: documentType,
            path: filePath,
            leadId: leadId,
            uploadedBy: req.user._id,
            mimeType: file.mimetype,
            size: file.size
        });

        const savedDocument = await document.save();
        console.log('Documento salvo:', savedDocument);

        res.status(201).json({
            success: true,
            data: savedDocument
        });

    } catch (error) {
        console.error('Erro ao fazer upload:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao fazer upload do documento',
            error: error.message
        });
    }
};

exports.getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ leadId: req.params.id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: documents
        });

    } catch (error) {
        console.error('Erro ao buscar documentos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar documentos'
        });
    }
};

exports.downloadDocument = async (req, res) => {
    try {
        console.log('Iniciando download do documento');
        
        const document = await Document.findOne({
            _id: req.params.documentId,
            leadId: req.params.id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Documento não encontrado'
            });
        }

        // Verifica se o arquivo existe
        try {
            await fs.access(document.path);
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: 'Arquivo não encontrado no servidor'
            });
        }

        // Define o tipo de conteúdo baseado na extensão do arquivo
        const ext = path.extname(document.originalName || document.name).toLowerCase();
        const mimeTypes = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png'
        };

        // Usar apenas o nome original do arquivo para download
        const downloadName = document.originalName;
        console.log('Nome do arquivo para download:', downloadName);

        // Configurar headers
        res.set({
            'Content-Type': mimeTypes[ext] || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${downloadName}"`,
            'Access-Control-Expose-Headers': 'Content-Disposition'
        });

        // Usando fs síncrono para createReadStream
        const fileStream = fsSync.createReadStream(document.path);
        fileStream.on('error', (error) => {
            console.error('Erro ao ler arquivo:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao ler arquivo'
            });
        });

        fileStream.pipe(res);

    } catch (error) {
        console.error('Erro ao baixar documento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao baixar documento'
        });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.documentId,
            leadId: req.params.id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Documento não encontrado'
            });
        }

        // Deletar o arquivo físico
        try {
            await fs.unlink(document.path);
        } catch (error) {
            console.error('Erro ao deletar arquivo:', error);
            // Continua mesmo se o arquivo não existir
        }

        // Deletar o registro do banco de dados
        await Document.findByIdAndDelete(document._id);

        res.json({
            success: true,
            message: 'Documento excluído com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir documento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir documento'
        });
    }
}; 