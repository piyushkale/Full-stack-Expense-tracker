const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

function generateTxt(expenses) {
  let content = "EXPENSE REPORT\n";
  content += "============================\n\n";

  expenses.forEach((e, index) => {
    content += `${index + 1}. Description: ${e.description}\n`;
    content += `   Amount: ${e.amount}\n`;
    content += `   Category: ${e.category}\n`;
    content += `   Note: ${e.note || "-"}\n`;
    content += "----------------------------\n";
  });

  return content;
}

const expenseFile = async (expenses, userId) => {
  const textData = generateTxt(expenses);

  const buffer = Buffer.from(textData, "utf-8");

  const fileName = `expenses/user-${userId}-${Date.now()}.txt`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: "text/plain",
  };

  await s3.upload(params).promise();

  const signedUrl = s3.getSignedUrl("getObject", {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Expires: 60 * 5, // 5 minutes
  });

  return signedUrl;
};

module.exports = expenseFile;
