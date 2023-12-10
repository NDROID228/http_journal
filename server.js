const http = require("http");
const fs = require("fs");
const url = require("url");

const hostname = "localhost";
const port = 7777;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  let URL = req.url;
  let URL_header = URL.match(/^[^?]+/);
  URL_header = URL_header[0];
  console.log(URL_header);
  console.log(`request: ${URL}`);
  switch (URL_header) {
    case "/":
      res.end(fs.readFileSync("index.html"));
      break;
    case "/favicon.ico":
      break;
    case "/home":
      const queryObject = url.parse(req.url, true).query;
      let code = queryObject.code;

      let pupil_file = fs.readFileSync("pupils.txt").toString();
      let teacher_file = fs.readFileSync("teachers.txt").toString();
       pupil_file = pupil_file.split("\n").map(v => v.split(","));
       teacher_file = teacher_file.split("\n").map(v => v.split(","));
       let pupil_index = pupil_file.findIndex(v=>v[0]==code); // TODO: GUIDE FOR USAGE
       let teacher_index = teacher_file.findIndex(v=>v[0]==code);
      if (pupil_index !== undefined) {
        let response_html = fs.readFileSync("grades.html").toString();
        console.log(pupil_file);
        response_html = response_html.replace("$REPLACE1$",pupil_file[pupil_index][1]);
        res.end(response_html);
      } else if(teacher_index !== undefined) {
        res.end(fs.readFileSync("add_grade_start.html"));
      } else {
        res.end(`<h1> 404: Page is not found </h1>`); // TODO: proper 404.html
      }

    //   res.end(fs.readFileSync("grades.html"));
      break;
    default:
      res.end(`<h1> 404: Page is not found </h1>`);
      break;
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
