class APIFeatures {
  // query (Query object from mongoose), queryString (query request)
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // hard copy of queryString (object format)
    const queryObj = { ...this.queryString };

    // all fields we want to exclude from the query
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]); // remove all those fields

    // Convert the queryString object to string
    let queryString = JSON.stringify(queryObj);

    // Use a regular expression to replace
    queryString = queryString.replace(/\b(gte|gt|lte|lt|in|all)\b/g, (match) => `$${match}`);

    console.log(queryString);
    this.query = this.query.find(JSON.parse(queryString));

    return this; // return object to allow methods chaining
  }

  sort() {
    if (this.queryString.sort) {
      // Split the value of the sort object and replace coma by space
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // default sort by createdAt descending
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    // Default fields
    else {
      this.query = this.query.select('-__v'); // all but exclude __v field
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; // convert string to number, page 1 by default
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
