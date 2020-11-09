const db = require('../data/connection');

module.exports = {
add,
findUser,
findBy,
findById,
};

function findUser() {
    return db("users")
  }
  
  function findBy(filter) {
    return db("users").where(filter).orderBy("id");
  }
  
  async function add(user) {
    try {
      const [id] = await db("users").insert(user, "id");
  
      return findById(id);
    } catch (error) {
      throw error;
    }
  }
  
  function findById(id) {
    return db("users").where({ id }).first();
  }