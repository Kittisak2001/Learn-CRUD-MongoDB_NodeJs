const {MongoClient} = require('mongodb');

async function main(){
    const url = 'mongodb+srv://demo:1234s6789@cluster0.n4kk5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

    const client = new MongoClient(url);

    try{
        await client.connect();

        await printCheapestSuburbs(client, "Australia", "Sydney", 10)

    }finally{
        await client.close();
    }
}

main().catch(console.error);

async function printCheapestSuburbs(client, country, market, maxNumberToPrint){
    const pipeline = [
        {
             '$match': {
            'bedrooms': 1, 
            'address.country': country, 
            'address.market': market, 
            'address.suburb': {
              '$exists': 1, 
              '$ne': ''
            }, 
            'room_type': 'Entire home/apt'
          }
        }, {
          '$group': {
            '_id': '$address.suburb', 
            'averagePrice': {
              '$avg': '$price'
            }
          }
        }, {
          '$sort': {
            'averagePrice': 1
          }
        }, {
          '$limit': maxNumberToPrint
        }
      ];

      const aggCursor =  client.db("sample_airbnb").collection("listingsAndReviews").aggregate(pipeline)


      await aggCursor.forEach(airbnbListing => {
          console.log(`${airbnbListing._id}: ${airbnbListing.averagePrice}`);
      })
}