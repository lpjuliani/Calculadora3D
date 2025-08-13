const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Função para criar ZIP do projeto
function createProjectZip() {
  const output = fs.createWriteStream('calculadora-3d-pro.zip');
  const archive = archiver('zip', {
    zlib: { level: 9 } // Máxima compressão
  });

  output.on('close', function() {
    console.log('✅ Projeto empacotado com sucesso!');
    console.log(`📦 Tamanho: ${archive.pointer()} bytes`);
    console.log('📁 Arquivo: calculadora-3d-pro.zip');
  });

  archive.on('error', function(err) {
    console.error('❌ Erro ao criar ZIP:', err);
  });

  archive.pipe(output);

  // Adicionar arquivos do projeto (excluindo node_modules e outros desnecessários)
  const filesToInclude = [
    'src/**/*',
    'public/**/*',
    'package.json',
    'package-lock.json',
    'vite.config.ts',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'tailwind.config.js',
    'postcss.config.js',
    'eslint.config.js',
    'index.html',
    'README.md'
  ];

  filesToInclude.forEach(pattern => {
    if (pattern.includes('*')) {
      archive.glob(pattern, {
        ignore: ['node_modules/**', '.git/**', 'dist/**', '.bolt/**']
      });
    } else {
      if (fs.existsSync(pattern)) {
        archive.file(pattern, { name: pattern });
      }
    }
  });

  archive.finalize();
}

// Executar se chamado diretamente
if (require.main === module) {
  createProjectZip();
}

module.exports = { createProjectZip };