db.createUser(
    {
        user: "user1",
        pwd: "hunter2",
        roles: [{ role: "readWrite", db: "musicdb" }]
    }
)