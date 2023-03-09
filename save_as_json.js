const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const url = 'https://www.startech.com.bd/component/graphics-card';

axios.get(url)
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html);
        const productElements = $('.p-item-inner');
        const products = [];

        productElements.each(function () {
            const product = {};
            product.id = uuidv4(); // generate a UUID and add it to the product object
            product.title = $(this).find('.p-item-name').text().trim();
            product.thumb = $(this).find('img').attr('src');
            const price = parseInt($(this).find('.p-item-price span').text().trim().replace(/,/g, '')) || 0
            const price2 = parseInt($(this).find('.p-item-price').text().trim().replace(/,/g, '')) || 0
            product.price = price || price2
            const shortDescriptions = $(this).find('.short-description ul li');
            product.shortDescription = [];
            shortDescriptions.each(function () {
                product.shortDescription.push($(this).text().trim());
            });

            const productDetailUrl = $(this).find('a').attr('href');

            axios.get(productDetailUrl)
                .then(detailResponse => {
                    const detailHtml = detailResponse.data;
                    const detail$ = cheerio.load(detailHtml);
                    product.description = detail$('.full-description p').text().trim();
                    product.image = detail$('.main-img').attr('src');
                    product.brand = detail$('.product-brand').text()
                    const stock = detail$('.product-status').text()
                    product.stock = stock === 'Out Of Stock' ? false : true
                    products.push(product);

                    // Check if all products have been scraped before writing to JSON file
                    if (products.length === productElements.length) {
                        const data = JSON.stringify(products);
                        const urlArray = url.split("/")
                        const fileName = urlArray[urlArray.length - 1]
                        fs.writeFile(`data/${fileName}.json`, data, (err) => {
                            if (err) throw err;
                            console.log(fileName, 'data written to file');
                        });
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        });
    })
    .catch(error => {
        console.log(error);
    });
