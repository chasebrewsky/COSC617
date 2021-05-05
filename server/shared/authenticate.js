
//check if the user is in session
function authenticate (req, res) { 
    if (req.session.userId) {
      return true;
    } else {
      return false;
    }
}

module.exports = authenticate;
