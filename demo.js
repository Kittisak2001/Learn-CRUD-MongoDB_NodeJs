const {MongoClient} = require('mongodb');

async function main(){
    const url = "mongodb+srv://demo:1234s6789@cluster0.n4kk5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

    const client = new MongoClient(url);

    try{
        await client.connect();
        // await listDatabases(client);
        // await createMultipleListings(client, [{
        //     name: "Lovely Loft",
        //     summary: "A charming loft in Paris",
        //     bedrooms: 1,
        //     bathrooms: 1
        // },
        // {
        //     name: "Kittisak",
        //     summary: "Kittisak Phatchaiphongsa",
        //     bedrooms: 2,
        //     bathrooms: 2
        // }])

        // await findOneListingByName(client, "Kittisak");
        
        // await findListingWithMinimunBedroomsBathroomsAndMostRecentReviews(client, {
        //     minimunNumberOfBedrooms: 4,
        //     minimunNumberOfBathrooms: 2,
        //     maximunNumberOfResults: 5
        // });

        // await updateListingByName(client, "Kittisak", {bedrooms: 6, beds: 8})

        // await upsertListingName(client, "afdsfsdafdsa", {name: "fsdafasdfsdafasd", bedrooms: 2, bathrooms: 2});

        // await updateAllListingToHavePropertyType(client);

        // await deleteListingByName(client, "Kittisak");

        await deletedListingScrapeBeforeDate(client, new Date("2019-02-15"))

    }catch(e) {
        console.error(e);
    }finally{
        await client.close();
    }
}

main();

async function deletedListingScrapeBeforeDate(client, date){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteMany({"last_scraped": {$lt: date}});

    console.log(`${result.deletedCount} document(s) was/were deleted.`)
}

async function deleteListingByName(client, nameOfListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteOne({name: nameOfListing});

    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

async function updateAllListingToHavePropertyType(client){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateMany({property_type: {$exists: false}},
        {$set: {property_type: "Unknow"}});
    
    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    console.log(`${result.modifiedCount} document(s) was/were updated `);
}

async function upsertListingName(client, nameOfListing, updatedListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne({name : nameOfListing}, {$set: updatedListing}, {upsert: true});
    console.log(`${result.matchedCount} document(s) matched the query criteria`);
    
    if(result.upsertedCount > 0){
        console.log(`One document was inserted with the id ${result.upsertedId}`);
    }else{
        console.log(`${result.modifiedCount} document(s) was/were updated`);
    }
}

async function updateListingByName(client, nameOfListing, updatedListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne({name : nameOfListing}, {$set: updatedListing});

    console.log(`${result.matchedCount} document(s) matched the query critrtia`);
    console.log(`${result.modifiedCount} document was/were updated`);
}

async function findListingWithMinimunBedroomsBathroomsAndMostRecentReviews(client, {
    minimunNumberOfBedrooms = 0,
    minimunNumberOfBathrooms = 0,
    maximunNumberOfResults = Number.MAX_SAFE_INTEGER
} = {}) 
    {
        const cursor =  client.db("sample_airbnb").collection("listingsAndReviews").find({
            bedrooms: {$gte: minimunNumberOfBedrooms},
            bathrooms: {$gte: minimunNumberOfBathrooms}
        }).sort({ last_review: -1})
        .limit(maximunNumberOfResults)

        const results = await cursor.toArray();

        if (results.length > 0){
            console.log(`Found listing(s) with at least ${minimunNumberOfBedrooms} bedrooms and ${minimunNumberOfBathrooms} bathrooms`);
            results.forEach((result, i) => {
                date = new Date(result.last_review).toDateString();
                console.log();
                console.log(`${i + 1}.  name: ${result.name}`);
                console.log(`   _id: ${result._id}`);
                console.log(`   bedrooms: ${result.bedrooms}`);
                console.log(`   bathrooms: ${result.bathrooms}`);
                console.log(`   most recent review date: ${new Date(result.last_review).toDateString()}`);    
            })
        }else{
            console.log(`Mo listing found with at least ${minimunNumberOfBedrooms} bedrooms and ${minimunNumberOfBathrooms} bathrooms`)
        }
    }

async function findOneListingByName(client, nameOfListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({name: nameOfListing});

    if(result){
        console.log(`Found a listing in the collection with the name '${nameOfListing}'`)
        console.log(result);
    }else{
        console.log(`No listing found with the name '${nameOfListing}'`);
    }
}

async function createMultipleListings(client, newListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListing);
    console.log(`${result.insertedCount} new listings created with the following id(s):`)
    console.log(result.insertedIds);
}

async function createListing(client, newListing){
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}`);
}


async function listDatabases(client) {
    const databasesList = await client.db().admin().listDatabases();
    console.log('Databases:');
    databasesList.databases.forEach(db => {
        console.log(`- ${db.name}`)
    })
}