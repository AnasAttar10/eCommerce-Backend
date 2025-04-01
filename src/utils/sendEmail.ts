import sgMail from "@sendgrid/mail";
type TOptions = {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
};
sgMail.setApiKey(process.env.SEND_GRID_KEY as string);
const sendEmail = (msg: TOptions) => {
  sgMail
    .send(msg)
    .then(() => {
      console.log("success");
    })
    .catch((error) => {
      console.error("there is an error ", error);
    });
};

export default sendEmail;
