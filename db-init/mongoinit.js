db.createUser(
    {
        user: "mongo-user",
        pwd: "hunter2",
        roles: [{ role: "readWrite", db: "musicdb" }]
    }
)
