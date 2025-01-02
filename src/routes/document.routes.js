const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Rota para listar documentos de um lead
router.get('/leads/:leadId/documents', async (req, res) => {
    try {
        const { leadId } = req.params;
        const leadDir = path.join(__dirname, '..', '..', 'uploads', 'leads', leadId);
        
        // Verifica se o diretório existe
        try {
            await fs.access(leadDir);
        } catch (error) {
            // Se o diretório não existe, retorna array vazio
            return res.json({ success: true, data: [] });
        }

        // Lê o conteúdo do diretório
        const files = await fs.readdir(leadDir);
        
        // Para cada arquivo, obtém suas informações
        const documentsPromises = files.map(async (fileName) => {
            const filePath = path.join(leadDir, fileName);
            const stats = await fs.stat(filePath);
            
            // Tenta ler o metadata do arquivo (se existir)
            let metadata = {};
            try {
                const metadataPath = path.join(leadDir, `${fileName}.meta.json`);
                const metadataContent = await fs.readFile(metadataPath, 'utf8');
                metadata = JSON.parse(metadataContent);
            } catch (error) {
                // Se não houver metadata, usa informações básicas
                metadata = {
                    type: path.extname(fileName).slice(1).toUpperCase(),
                    status: 'Pendente',
                    uploadedAt: stats.birthtime
                };
            }

            return {
                _id: fileName, // Usando nome do arquivo como ID
                name: fileName,
                originalName: metadata.originalName || fileName,
                type: metadata.type || path.extname(fileName).slice(1).toUpperCase(),
                status: metadata.status || 'Pendente',
                size: stats.size,
                createdAt: metadata.uploadedAt || stats.birthtime,
                path: filePath
            };
        });

        const documents = await Promise.all(documentsPromises);
        
        res.json({
            success: true,
            data: documents
        });

    } catch (error) {
        console.error('Erro ao listar documentos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar documentos',
            error: error.message
        });
    }
});

// Rota para upload de documento
router.post('/leads/:leadId/documents', async (req, res) => {
    try {
        console.log('Iniciando upload de documento');
        console.log('Request files:', req.files);
        console.log('Request body:', req.body);

        if (!req.files || !req.files.document) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum arquivo enviado'
            });
        }

        const { leadId } = req.params;
        const file = req.files.document;
        const { documentType } = req.body;

        console.log('Dados do arquivo:', {
            name: file.name,
            size: file.size,
            mimetype: file.mimetype
        });

        // Criar diretório base de uploads se não existir
        const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });
        
        // Criar diretório de leads se não existir
        const leadsDir = path.join(uploadsDir, 'leads');
        await fs.mkdir(leadsDir, { recursive: true });
        
        // Criar diretório específico do lead
        const leadDir = path.join(leadsDir, leadId);
        await fs.mkdir(leadDir, { recursive: true });

        console.log('Diretórios criados:', {
            uploadsDir,
            leadsDir,
            leadDir
        });

        // Logs adicionais para debug
        console.log('Estrutura de diretórios:');
        console.log('- Base dir:', __dirname);
        console.log('- Uploads dir:', uploadsDir);
        console.log('- Leads dir:', leadsDir);
        console.log('- Lead dir:', leadDir);
        
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(leadDir, fileName);
        const metadataPath = path.join(leadDir, `${fileName}.meta.json`);

        console.log('Caminhos dos arquivos:');
        console.log('- Arquivo:', filePath);
        console.log('- Metadata:', metadataPath);

        // Verificar permissões do diretório
        try {
            await fs.access(leadDir, fs.constants.W_OK);
            console.log('Diretório tem permissão de escrita');
        } catch (error) {
            console.error('Erro de permissão no diretório:', error);
        }

        // Mover o arquivo
        await file.mv(filePath);
        console.log('Arquivo movido com sucesso');

        // Criar metadata
        const metadata = {
            originalName: file.name,
            type: documentType,
            status: 'Pendente',
            uploadedAt: new Date(),
            mimeType: file.mimetype
        };

        console.log('Tentando salvar metadata:', metadata);
        
        // Salvar metadata
        await fs.writeFile(
            metadataPath,
            JSON.stringify(metadata, null, 2)
        );
        
        console.log('Metadata salvo com sucesso');

        console.log('Upload concluído com sucesso');

        res.json({
            success: true,
            data: {
                _id: fileName,
                name: fileName,
                originalName: file.name,
                type: documentType,
                status: 'Pendente',
                size: file.size,
                createdAt: new Date(),
                path: filePath
            }
        });

    } catch (error) {
        console.error('Erro completo:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Erro no upload do documento',
            error: error.message,
            stack: error.stack
        });
    }
});

// Rota para download de documento
router.get('/leads/:leadId/documents/:documentId/download', async (req, res) => {
    try {
        const { leadId, documentId } = req.params;
        const filePath = path.join(__dirname, '..', '..', 'uploads', 'leads', leadId, documentId);

        // Verifica se o arquivo existe
        await fs.access(filePath);

        // Lê o metadata para obter o nome original
        let originalName = documentId;
        try {
            const metadataPath = path.join(
                __dirname, '..', '..', 'uploads', 'leads', leadId, 
                `${documentId}.meta.json`
            );
            const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
            originalName = metadata.originalName;
        } catch (error) {
            console.warn('Metadata não encontrado para:', documentId);
        }

        res.download(filePath, originalName);

    } catch (error) {
        console.error('Erro ao baixar documento:', error);
        res.status(404).json({
            success: false,
            message: 'Documento não encontrado',
            error: error.message
        });
    }
});

module.exports = router; 