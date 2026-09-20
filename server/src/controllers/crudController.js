export const list =
  (Model, filter = {}) =>
  async (req, res, next) => {
    try {
      res.json(await Model.find(filter).sort({ createdAt: -1 }).limit(200));
    } catch (e) {
      next(e);
    }
  };
export const adminList = (Model) => async (req, res, next) => {
  try {
    res.json(await Model.find({}).sort({ createdAt: -1 }).limit(500));
  } catch (e) {
    next(e);
  }
};
export const get =
  (Model, publicFilter = {}) =>
  async (req, res, next) => {
    try {
      const item = await Model.findOne({ _id: req.params.id, ...publicFilter });
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json(item);
    } catch (e) {
      next(e);
    }
  };
export const create =
  (Model, fields = []) =>
  async (req, res, next) => {
    try {
      const body = fields.length
        ? Object.fromEntries(
            fields.filter((k) => req.body[k] !== undefined).map((k) => [k, req.body[k]]),
          )
        : req.body;
      res.status(201).json(await Model.create(body));
    } catch (e) {
      next(e);
    }
  };
export const update =
  (Model, fields = []) =>
  async (req, res, next) => {
    try {
      const body = fields.length
        ? Object.fromEntries(
            fields.filter((k) => req.body[k] !== undefined).map((k) => [k, req.body[k]]),
          )
        : req.body;
      const item = await Model.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
      });
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json(item);
    } catch (e) {
      next(e);
    }
  };
export const remove = (Model) => async (req, res, next) => {
  try {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
};
