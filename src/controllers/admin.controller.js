const Property = require('../models/property.model');
const Lead = require('../models/lead.model');
const User = require('../models/user.model');
const asyncHandler = require('../middleware/async');

exports.getDashboardData = asyncHandler(async (req, res, next) => {
    const totalProperties = await Property.countDocuments();
    const totalLeads = await Lead.countDocuments();
    const totalAgents = await User.countDocuments({ role: 'corretor' });
    const pendingApprovals = await User.countDocuments({ role: 'corretor', isApproved: false });

    const propertiesByType = await Property.aggregate([
        { $group: { _id: '$propertyType', count: { $sum: 1 } } },
        { $project: { _id: 0, type: '$_id', count: 1 } }
    ]);

    const leadsByStatus = await Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } }
    ]);

    // Simular atividades recentes (você precisará implementar um sistema de log de atividades real)
    const recentActivities = [
        { user: 'João', action: 'adicionou', target: 'uma nova propriedade', date: new Date() },
        { user: 'Maria', action: 'atualizou', target: 'um lead', date: new Date(Date.now() - 3600000) },
        { user: 'Pedro', action: 'excluiu', target: 'uma propriedade', date: new Date(Date.now() - 7200000) }
    ];

    res.status(200).json({
        success: true,
        data: {
            totalProperties,
            totalLeads,
            totalAgents,
            pendingApprovals,
            propertiesByType: Object.fromEntries(propertiesByType.map(item => [item.type, item.count])),
            leadsByStatus: Object.fromEntries(leadsByStatus.map(item => [item.status, item.count])),
            recentActivities
        }
    });
});