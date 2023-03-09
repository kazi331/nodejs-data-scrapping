const axios = require("axios");
const cheerio = require("cheerio");

// The URL of the website to scrape
const url = "https://www.startech.com.bd/laptop-notebook";

// Send a GET request to the website and get the HTML content
axios.get(url)
    .then(response => {
        // Parse the HTML content using Cheerio
        const $ = cheerio.load(response.data);

        // Create an empty array to store the product data
        const productData = [];

        // Find all the product elements
        const productElements = $(".p-item-inner");

        console.log(`Number of products found: ${productElements.length}`); // Debugging line

        // Loop through the product elements and extract relevant data
        productElements.each((index, element) => {
            // Extract the product name
            const productName = $(element).find(".p-item-name").text().trim();

            // Extract the product image URL
            const productThumb = $(element).find("img").attr("src");

            // Extract the product price
            const priceText = $(element).find(".p-item-price span").text().trim();
            const productPriceNumber = priceText.split("৳")[0].replace(",", "");
            const productPrice = parseInt(productPriceNumber);

            // Find all short descriptions
            const shortDescriptionList = $(element).find(".short-description ul");
            const descs = [];

            // Loop through description items
            shortDescriptionList.each((index, element) => {
                const desc = $(element).find("li");
                const descTexts = desc.map((index, element) => $(element).text().trim()).get();
                descs.push(...descTexts);
            });

            // Extract the product detail URL
            const productDetailUrl = $(element).find("a").attr("href");

            // Send a GET request to the product detail page and get the HTML content
            axios.get(productDetailUrl)
                .then(productDetailResponse => {
                    // Parse the HTML content using Cheerio
                    const productDetailHtml = productDetailResponse.data;
                    const productDetail$ = cheerio.load(productDetailHtml);

                    // Extract the product description
                    const productDescription = productDetail$(".full-description p").text().trim();

                    // Extract the product image URL
                    const productImage = productDetail$("img.main-img").attr("src");

                    // Create an object with the product data
                    const productObj = {
                        name: productName,
                        price: productPrice,
                        thumb_url: productThumb,
                        image_url: productImage,
                        description: productDescription,
                        short_description: descs,
                    };

                    // Push the product object to the product data array
                    productData.push(productObj);

                    if (productData.length === productElements.length) {
                        // Convert the product data to a JSON string
                        const jsonData = JSON.stringify(productData);

                        // Print the JSON data
                        console.log(jsonData);
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
