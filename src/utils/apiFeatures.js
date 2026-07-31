class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
        this._filterObj = {};
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ["page", "sort", "limit", "fields"];
        excludedFields.forEach((el) => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`,
        );

        this._filterObj = JSON.parse(queryStr);
        this.query = this.query.find(this._filterObj);

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("-createdAt");
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select("-__v");
        }
        return this;
    }

    paginate() {
        const page = Math.max(1, this.queryString.page * 1 || 1);
        const MAX_LIMIT = 100;
        const requested = this.queryString.limit * 1 || 2; // e.g. 2 posts per page for learning
        const limit = Math.min(requested, MAX_LIMIT);
        const skip = (page - 1) * limit;

        this.page = page;
        this.limit = limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

    async countTotal(Model, scopeFilter = {}) {
        return Model.countDocuments({ ...scopeFilter, ...this._filterObj });
    }
}

export default APIFeatures;
