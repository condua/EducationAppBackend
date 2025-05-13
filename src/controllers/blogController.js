const Blog = require("../models/Blog");
// Controller createBlog
exports.createBlog = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log dữ liệu nhận được từ frontend

    const { title, content, author, imageTitle } = req.body;

    if (!title || !content || !author || !imageTitle) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const newBlog = new Blog({
      title,
      content,
      author,
      imageTitle, // Lưu imageTitle vào blog
    });

    await newBlog.save();
    res.status(201).json(newBlog); // Trả về blog đã tạo
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ all Blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// // READ one Blog
// exports.getBlogById = async (req, res) => {
//   try {
//     const blog = await Blog.findById(req.params.id);
//     if (!blog) {
//       return res.status(404).json({ message: "Blog not found" });
//     }
//     res.status(200).json(blog);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };
// READ one Blog and render HTML with meta tags, or return JSON
exports.getBlogById = async (req, res) => {
  try {
    // Lấy bài blog từ cơ sở dữ liệu
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Kiểm tra xem yêu cầu có phải từ trình duyệt (hiển thị HTML) hay không
    const isBotRequest =
      req.headers["user-agent"] &&
      req.headers["user-agent"].toLowerCase().includes("facebook");

    if (isBotRequest) {
      // Nếu là yêu cầu từ Facebook bot, trả về HTML với meta tags
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <!-- Open Graph Meta Tags -->
            <meta property="og:title" content="${blog.title}" />
            <meta property="og:description" content="${blog.description}" />
            <meta property="og:image" content="${blog.imageUrl}" />
            <meta property="og:url" content="https://yourdomain.com/blog/${req.params.id}" />
            <meta property="og:type" content="article" />
            <title>${blog.title}</title>
          </head>
          <body>
            <div id="root">
              <h1>${blog.title}</h1>
              <p>${blog.content}</p>
            </div>
          </body>
        </html>
      `;

      // Trả về HTML đã render
      return res.status(200).send(htmlContent);
    } else {
      // Nếu không phải yêu cầu từ Facebook bot, trả về JSON
      return res.status(200).json(blog);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE Blog
exports.updateBlog = async (req, res) => {
  try {
    const { title, content, author, imageTitle } = req.body;
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content, author, imageTitle },
      { new: true }
    );
    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE Blog
exports.deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
