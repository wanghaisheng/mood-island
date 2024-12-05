const fs = require('fs');
const path = require('path');

const locales = ['','en', 'fr', 'zh', 'es', 'de'];
const baseDir = path.join(__dirname, '/');
const baseUrl = 'https://heymanifestation.com';

function listHtmlFiles(dir) {
    return fs.readdirSync(dir).reduce((files, file) => {
        const filePath = path.join(dir, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        if (isDirectory) {
            return files.concat(listHtmlFiles(filePath));
        }
        if (path.extname(file) === '.html') {
            return files.concat([filePath]);
        }
        return files;
    }, []);
}

const allHtmlFiles = locales.flatMap(locale => {
    const localeDir = path.join(baseDir, locale);
    return listHtmlFiles(localeDir).map(file => path.join(locale, path.relative(localeDir, file)).replace(/\\+/g, '/'));
});

const sitemap = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    ...allHtmlFiles.map(file => ({
        loc: `/${file.replace('.html', '')}`,
        changefreq: 'weekly',
        priority: '0.9'
    }))
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${sitemap.map(item => `    <url>
        <loc>${baseUrl}${item.loc}</loc>
        <changefreq>${item.changefreq}</changefreq>
        <priority>${item.priority}</priority>
    </url>`).join('\n')}
</urlset>`;

fs.writeFileSync('sitemap.xml', sitemapXml);

console.log('Sitemap has been generated and saved to sitemap.xml');
