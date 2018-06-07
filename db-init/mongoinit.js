db.createUser(
    {
        user: "mongo-user",
        pwd: "hunter2",
        roles: ["readWrite", "dbAdmin"]
    }
)
