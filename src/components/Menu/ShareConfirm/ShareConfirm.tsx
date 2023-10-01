import { Button, Input, Space, message } from "antd";
import { EmailIcon, EmailShareButton, FacebookIcon, FacebookShareButton, LineIcon, LineShareButton, TwitterIcon, TwitterShareButton } from "react-share";
import {
    CopyOutlined,
  } from "@ant-design/icons";

const ShareConfirm = (title: string ,share_key : string, list_name:string) => ({
    title: title,
    content: (
      <>
        <div>次のURLを共有相手に送って下さい。</div>
        <Space.Compact style={{ width: "100%" }}>
          <Input
            value={
              "https://memory-cart.onrender.com/kaimono?key=" +
              share_key
            }
            readOnly
            bordered={false}
            style={{ color: "#000", backgroundColor: "#323232" }}
          />
          <Button
            onClick={() => {
              navigator.clipboard.writeText(
                "https://memory-cart.onrender.com/kaimono?key=" +
                  share_key
              );
              // TODO:Warningがでる
              message.info("クリップボードにURLをコピーしました。");
            }}
          >
            <CopyOutlined />
          </Button>
        </Space.Compact>
        <Space style={{ width: "100%",paddingTop:"10px" }}>
          <EmailShareButton
            url={
              "https://memory-cart.onrender.com/kaimono?key=" +
              share_key
            }
            title={list_name}
          >
            <EmailIcon size={40} round />
          </EmailShareButton>
          <FacebookShareButton
            url={
              encodeURIComponent("https://memory-cart.onrender.com/kaimono?key=" +
              share_key)
            }
            quote={list_name}
          >
            <FacebookIcon size={40} round />
          </FacebookShareButton>
          <TwitterShareButton
            url={
              encodeURIComponent("https://memory-cart.onrender.com/kaimono?key=" +
              share_key)
            }
            title={list_name}
          >
            <TwitterIcon size={40} round />
          </TwitterShareButton>
          <LineShareButton
            url={
              encodeURIComponent("https://memory-cart.onrender.com/kaimono?key=" +
              share_key)
            }
            title={list_name}
          >
            <LineIcon size={40} round />
          </LineShareButton>
        </Space>
      </>
    ),
  });

  export default ShareConfirm;
  