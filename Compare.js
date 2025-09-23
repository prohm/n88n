const currentProducts = $('Product Info').all(); 
const existingData = $('Get All Rows from Sheet').all(); 

const existingSKUMap = {};
existingData.forEach(item => {
  const sku = item.json.sku;
  if (!existingSKUMap[sku]) {
    existingSKUMap[sku] = [];
  }
  existingSKUMap[sku].push(item.json);
});

Object.keys(existingSKUMap).forEach(sku => {
  existingSKUMap[sku].sort((a, b) => new Date(b.time) - new Date(a.time));
});

const dataToAdd = [];

currentProducts.forEach(currentItem => {
  const currentProduct = currentItem.json;
  const sku = currentProduct.sku;  

  if (!existingSKUMap[sku]) {
    dataToAdd.push({
      json: {
        ...currentProduct,
        action: 'new_product'
      }
    });
  } else {

    const latestRecord = existingSKUMap[sku][0];     
    if (currentProduct.salePrice !== latestRecord.salePrice) { 
      dataToAdd.push({
        json: {
          ...currentProduct,
          action: 'price_changed',
          previousPrice: latestRecord.salePrice
        }
      });
    }
  }
});

return dataToAdd;
