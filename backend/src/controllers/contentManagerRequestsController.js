/**
 * Controlador de solicitudes para pasar a gestor de contenido.
 * Los usuarios crean solicitudes y administracion las revisa.
 */
const contentManagerRequestsService = require('../services/contentManagerRequestsService');
const usersService = require('../services/usersService');
const rolesService = require('../services/rolesService');
const { toPositiveIntParam } = require('../utils/validation');

const ALLOWED_REQUESTER_ROLES = ['user'];
const ALLOWED_REVIEW_STATUS = ['approved', 'rejected'];

const MAX_PHONE_LENGTH = 30;
const MAX_ORGANIZATION_LENGTH = 150;
const MAX_PROPOSAL_TITLE_LENGTH = 150;
const MAX_PROPOSAL_DESCRIPTION_LENGTH = 2000;
const MAX_ADMIN_NOTES_LENGTH = 500;

function parseCreatePayload(body) {
  const phoneRaw = typeof body.phone === 'string' ? body.phone.trim() : '';
  const organizationRaw = typeof body.organization_name === 'string' ? body.organization_name.trim() : '';
  const proposalTitleRaw = typeof body.proposal_title === 'string' ? body.proposal_title.trim() : '';
  const proposalDescriptionRaw = typeof body.proposal_description === 'string' ? body.proposal_description.trim() : '';

  if (phoneRaw.length > MAX_PHONE_LENGTH) {
    return { error: `El telefono no puede superar los ${MAX_PHONE_LENGTH} caracteres.` };
  }

  if (organizationRaw.length > MAX_ORGANIZATION_LENGTH) {
    return { error: `La organizacion no puede superar los ${MAX_ORGANIZATION_LENGTH} caracteres.` };
  }

  if (!proposalTitleRaw || proposalTitleRaw.length > MAX_PROPOSAL_TITLE_LENGTH) {
    return { error: `El titulo es obligatorio y no puede superar los ${MAX_PROPOSAL_TITLE_LENGTH} caracteres.` };
  }

  if (!proposalDescriptionRaw || proposalDescriptionRaw.length > MAX_PROPOSAL_DESCRIPTION_LENGTH) {
    return { error: `La descripcion es obligatoria y no puede superar los ${MAX_PROPOSAL_DESCRIPTION_LENGTH} caracteres.` };
  }

  return {
    phone: phoneRaw || null,
    organizationName: organizationRaw || null,
    proposalTitle: proposalTitleRaw,
    proposalDescription: proposalDescriptionRaw
  };
}

function parseReviewPayload(body) {
  const status = typeof body.status === 'string' ? body.status.trim().toLowerCase() : '';
  const adminNotesRaw = typeof body.admin_notes === 'string' ? body.admin_notes.trim() : '';

  if (!ALLOWED_REVIEW_STATUS.includes(status)) {
    return { error: 'El estado de revision debe ser approved o rejected.' };
  }

  if (adminNotesRaw.length > MAX_ADMIN_NOTES_LENGTH) {
    return { error: `Las notas de revision no pueden superar los ${MAX_ADMIN_NOTES_LENGTH} caracteres.` };
  }

  return {
    status,
    adminNotes: adminNotesRaw || null
  };
}

async function create(req, res) {
  const userId = Number(req.user?.id);
  const parsedPayload = parseCreatePayload(req.body || {});

  if (parsedPayload.error) {
    return res.status(400).json({ error: parsedPayload.error });
  }

  try {
    const user = await usersService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (!ALLOWED_REQUESTER_ROLES.includes(user.role)) {
      return res.status(400).json({ error: 'Tu cuenta ya tiene permisos de gestion o administracion.' });
    }

    const pendingRequest = await contentManagerRequestsService.getPendingRequestByUserId(userId);
    if (pendingRequest) {
      return res.status(409).json({ error: 'Ya tienes una solicitud pendiente de revision.' });
    }

    const requestId = await contentManagerRequestsService.createRequest({
      userId,
      ...parsedPayload
    });

    const requests = await contentManagerRequestsService.listRequestsByUserId(userId);
    const createdRequest = requests.find((requestItem) => Number(requestItem.id) === Number(requestId)) || null;

    return res.status(201).json({
      message: 'Solicitud enviada. Administracion la revisara lo antes posible.',
      request: createdRequest
    });
  } catch (error) {
    console.error('Error creating content manager request:', error);
    return res.status(500).json({ error: 'Error interno al enviar la solicitud.' });
  }
}

async function listMine(req, res) {
  const userId = Number(req.user?.id);

  try {
    const requests = await contentManagerRequestsService.listRequestsByUserId(userId);
    return res.json({ requests });
  } catch (error) {
    console.error('Error listing own content manager requests:', error);
    return res.status(500).json({ error: 'Error interno al consultar tus solicitudes.' });
  }
}

async function listAll(req, res) {
  const statusRaw = typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : '';
  const status = statusRaw && ['pending', 'approved', 'rejected'].includes(statusRaw) ? statusRaw : null;

  try {
    const requests = await contentManagerRequestsService.listRequests(status);
    return res.json({ requests });
  } catch (error) {
    console.error('Error listing content manager requests:', error);
    return res.status(500).json({ error: 'Error interno al consultar solicitudes.' });
  }
}

async function review(req, res) {
  const requestId = toPositiveIntParam(req.params.id);
  if (!requestId) {
    return res.status(400).json({ error: 'Identificador de solicitud invalido.' });
  }

  const parsedPayload = parseReviewPayload(req.body || {});
  if (parsedPayload.error) {
    return res.status(400).json({ error: parsedPayload.error });
  }

  try {
    const contentManagerRole = await rolesService.getRoleByName('content_manager');
    if (!contentManagerRole) {
      return res.status(500).json({ error: 'No existe el rol content_manager.' });
    }

    const reviewResult = await contentManagerRequestsService.reviewRequest({
      requestId,
      nextStatus: parsedPayload.status,
      adminNotes: parsedPayload.adminNotes,
      reviewerId: Number(req.user.id),
      contentManagerRoleId: contentManagerRole.id
    });

    if (reviewResult.notFound) {
      return res.status(404).json({ error: 'Solicitud no encontrada.' });
    }

    if (reviewResult.alreadyReviewed) {
      return res.status(409).json({ error: `La solicitud ya fue revisada (${reviewResult.status}).` });
    }

    return res.json({
      message: parsedPayload.status === 'approved'
        ? 'Solicitud aprobada y rol actualizado a gestor de contenido.'
        : 'Solicitud rechazada.',
      request: reviewResult.request
    });
  } catch (error) {
    console.error('Error reviewing content manager request:', error);
    return res.status(500).json({ error: 'Error interno al revisar la solicitud.' });
  }
}

module.exports = {
  create,
  listMine,
  listAll,
  review
};
