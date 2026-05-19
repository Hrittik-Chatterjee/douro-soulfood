import fs from 'fs';
import https from 'https';

const url = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80';
const file = fs.createWriteStream('c:/projects/douro-soulfood-main/src/hero_image_debug.jpg');

https.get(url, function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close();
    console.log('Download complete');
  });
}).on('error', function(err) {
  console.error('Error downloading file:', err);
});
