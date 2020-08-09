const pdf = require('html-pdf');
const hbs = require('handlebars');
const fs = require('fs');
const appRoot = require('app-root-path');
const { toPdfOption } = require('../configs/default');

const convertToPDF = async (post, postTags) => {
    let success = true;
    var template = fs.readFileSync(appRoot.path + '\\src\\views\\post\\pdf.hbs');
    var html = hbs.compile(template.toString())({post, postTags});
    await pdf.create(html, toPdfOption).toFile(appRoot.path + `\\public\\files\\${post.slug}.pdf`, function (err, res) {
        if(err) {
            success = false;
            console.log(err);
        }
    })

    return success;
}

module.exports = { convertToPDF }