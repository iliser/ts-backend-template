import * as mime from 'mime/lite'
import * as fs from 'fs'

const fileDeleteHandlers = {};
const fileToDelete = new Set();
const genName = (ext) => Math.random().toString(32).substr(2) + Math.random().toString(32).substr(2) + "." + ext;
export const onFile = (fieldName, stream, filename, encoding, mimetype, body) => {
  console.log(`File ${fieldName} ${mimetype}`);
  let ext = mime.getExtension(mimetype);

  let rndName = genName(ext)

  // TODO rewrite to async
  while (fs.existsSync("public/" + rndName)) rndName = genName(ext);
  const filePath = "public/" + rndName;


  fileToDelete.add(filePath);
  fileDeleteHandlers[filePath] = setTimeout(() => {
    fileToDelete.delete(filePath);
    delete fileDeleteHandlers[filePath];
    fs.unlinkSync(filePath);
  }, 1000 * 60);

  console.log(body[fieldName] = { url: filePath });

  stream.pipe(fs.createWriteStream(filePath));
  // stream.close(
}

export function safeFile(filename: string) {
  // if (filename.startsWith("public")) filename = filename.substr(7);

  clearTimeout(fileDeleteHandlers[filename]);
  fileToDelete.delete(filename);
}

// mongoose post middleware
export function buildFileSaver(schemaPaths: string[] | string) {
  const paths = typeof schemaPaths == "string" ? schemaPaths.split(' ') : schemaPaths;
  return function (doc, next) {
    for (let p of paths) if (doc[p].url) safeFile(doc[p].url);
    next();
  }
}