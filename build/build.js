const Bundler = require('parcel');
const fs = require('fs')
const archiver = require('archiver')
const package = require('../package')

process.env.NODE_ENV = 'production';
const options = {
  minify: true,
  cache: true,
  sourceMaps: true,
  autoinstall: true,
  contentHash: false,
  publicUrl: './',
};

async function main(){
  // 同步manifest的版本
  console.log('sync version...', package.version)
  var manifest = fs.readFileSync('manifest.json', {
    encoding: 'utf-8'
  })
  manifest = manifest.replace(/("version"\s*:\s*)"(\d+\.\d+\.\d+)"/, function (_, v) {
    return v + '"' + package.version + '"';
  })
  fs.writeFileSync('manifest.json', manifest)

  const bundler = new Bundler(['src/*.html', 'src/background.ts'], options)
  await bundler.bundle()
  bundler.stop()
  await zip('manifest.json', 'versions/mlh-'+package.version+'.zip')
  moveFile(zipFileName, 'versions/' + package.version)
  console.log('done')
}
main().catch(e => console.error(e))


function zip(manifest, filename) {
  console.log('ziping...', manifest)
  var archive = archiver.create('zip', {})
  var output = fs.createWriteStream(filename)

  archive
    .directory('dist')
    .directory('icon')
    .directory('_locales')
    .file(manifest)
    .pipe(output)

  return archive.finalize()
}

function moveFile(sourcePath, destinationDir) {
  const fileName = sourcePath.split('/').pop()
  const destinationPath = destinationDir + '/' + fileName

  fs.mkdirSync(destinationDir, { recursive: true })
  fs.renameSync(sourcePath, destinationPath)
  console.log('File moved to:', destinationPath)
}