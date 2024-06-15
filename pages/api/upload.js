import nextConnect from 'next-connect';
import multer from 'multer';
import path from 'path';

const upload = multer({
  dest: 'public/uploads/',
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

const handler = nextConnect();

handler.use(upload.single('video'));

handler.post((req, res) => {
  const videoPath = path.join('/uploads', req.file.filename);
  res.status(200).json({ videoPath });
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
