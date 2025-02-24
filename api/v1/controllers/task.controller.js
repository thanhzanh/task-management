const Task = require("../models/task.model");

const paginationHelper = require("../../../helpers/pagination");
const searchHelper = require("../../../helpers/search");

// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
    const find = {
        deleted: false
    };

    // nếu có status truyền lên thì thêm key status vào find
    if (req.query.status) {
        find.status = req.query.status;
    }

    // search
    let objectSearch = searchHelper(req.query);

    if(req.query.keyword) {
        find.title = objectSearch.regex;
    }
    // end search

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

// [PATCH] /api/v1/tasks/change-status/:id
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.body.status;

        await Task.updateOne({
            _id: id
        }, {
            status: status
        });

        res.json({
            code: 200,
            message: "Cập nhật trạng thái thành công!"
        });
    } catch (error) {
        res.json({
            code: 404,
            message: "Không tồn tại!"
        });
    }
};

// [PATCH] /api/v1/tasks/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        // nhận lại object, phá vỡ nó ra
        const { ids, key, value } = req.body;

        switch (key) {
            case "status":
                await Task.updateMany({
                    _id: { $in: ids }
                }, {
                    status: value
                });
                res.json({
                    code: 200,
                    message: "Cập nhật trạng thái thành công!"
                });
                break;
            case "delete":
                await Task.updateMany({
                    _id: { $in: ids }
                }, {
                    deleted: true,
                    deletedAt: new Date()
                });
                res.json({
                    code: 200,
                    message: "Xóa thành công!"
                });
                break;
        
            default:
                res.json({
                    code: 404,
                    message: "Không tồn tại!"
                });
                break;
        }
        
    } catch (error) {
        res.json({
            code: 404,
            message: "Không tồn tại!"
        });
    }
};

// [POST] /api/v1/tasks/create
module.exports.create = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const task = new Task(req.body);
        const data = await task.save();

        res.json({
            code: 200,
            message: "Tạo mới công việc thành công!",
            data: data
        });
        
    } catch (error) {
        res.json({
            code: 400,
            message: "Lỗi!"
        });
    }
}

// [PATCH] /api/v1/tasks/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        await Task.updateOne({ _id: id }, req.body);

        res.json({
            code: 200,
            message: "Cập nhật công việc thành công!",
        });
        
    } catch (error) {
        res.json({
            code: 400,
            message: "Lỗi!"
        });
    }
}

// [DELETE] /api/v1/tasks/delete/:id
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;

        await Task.updateOne({ _id: id }, 
            {
                deleted: true,
                deletedAt: new Date()
            }
        );

        res.json({
            code: 200,
            message: "Xóa công việc thành công!",
        });
        
    } catch (error) {
        res.json({
            code: 400,
            message: "Lỗi!"
        });
    }
}

