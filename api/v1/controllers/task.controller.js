const Task = require("../models/task.model");

const paginationHelper = require("../../../helpers/pagination");

// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
    const find = {
        deleted: false
    };

    // nếu có status truyền lên thì thêm key status vào find
    if (req.query.status) {
        find.status = req.query.status;
    }

    // pagination
    let initPagination = {
        currentPage: 1,
        limitItem: 2,
    }

    // tổng số công việc
    const countTasks = await Task.countDocuments(find);

    const objectPagination = paginationHelper(
        initPagination,
        req.query,
        countTasks
    )
    // end pagination

    // sort
    const sort = {};

    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    }
    // end sort

    const tasks = await Task.find(find).sort(sort).skip(objectPagination.skip).limit(objectPagination.limitItem);

    res.json(tasks);
};

// [GET] /api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;

        const tasks = await Task.findOne({
            _id: id,
            deleted: false,
        });

        res.json(tasks);
    } catch (error) {
        res.json("Khong tim thay");
    }
};
