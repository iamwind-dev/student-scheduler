module.exports = async function (context, req) {
  const semester = req.query.semester || "2025A";

  const data = [
    { id: "1", code: "CS101", name: "Lập trình C cơ bản", semester: "2025A" },
    { id: "2", code: "CS202", name: "Cấu trúc dữ liệu", semester: "2025A" }
  ];

  context.res = {
    status: 200,
    body: data.filter(c => c.semester === semester)
  };
};
