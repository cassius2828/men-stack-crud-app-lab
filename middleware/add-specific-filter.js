// gives the specific filter to the ejs file if it is needed
const addSpecificFilter = (req, res, next) => {
    const { filterBy } = req.params;
    console.log(req.params)
    const specificFilter = req.query[filterBy] || false;
    res.locals.specificFilter = specificFilter;
    next();
  };
  
  module.exports = addSpecificFilter;
  