const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // In-memory storage
const convertMarkdown = require('../../../utils/basecamp/convert_markdown.js');
const createBasecampDoc = require('../../../utils/basecamp/create_doc.js');
const requireDashboardAuth = require('../../../middleware/requireDashboardAuth.js');
const { ensureBasecampToken } = require('../../../middleware/basecamp');

router.post('/upload-markdown', requireDashboardAuth, ensureBasecampToken, upload.single('markdown'), async (req, res) => {
  try {
    const { bucketId } = req.body;
    const markdown = req.file.buffer.toString('utf-8');
    const basecampMarkdown = convertMarkdown(markdown);
    await createBasecampDoc(req.basecampToken, bucketId, basecampMarkdown);
    res.status(200).send({ success: true });
  } catch (err) {
    console.error('[upload-markdown] error:', err);
    res.status(500).json({ error: 'Failed to create Basecamp doc' });
  }
});

module.exports = router;