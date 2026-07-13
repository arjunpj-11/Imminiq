export const paginate = (page = 1, limit = 20) => ({
  skip: (page - 1) * limit,
  limit,
});

export const paginationMeta = (total: number, page: number, limit: number) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
});
