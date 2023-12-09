import React from "react";
// import Background from "./assets/background.gif"

import "./styles/App.css";

function App() {
  return (
    <div className="App background">
      <div className="outerDiv">
        <div className="innerDiv">
          <div className="padding">Hello World, This is Flavio Herrera</div>
          <div className="padding" style={{ color: "yellow" }}>
            I am a Full Stack Developer, well um kinda
          </div>
          <div className="">
            <div>This website was put together last minute 😵‍💫</div>
            <img
              src="https://d10jdocmg93kuh.cloudfront.net/20/8d/208d7839-f970-4fcd-965e-4e1dc9ec33fa.jpg"
              alt=""
            />
            <br />
            <div>
              I have however worked on many projects in the past with one
              currently in temporary pause but will resume progress again soon
              after finals.
            </div>
            <br />
            <p style={{ color: "skyblue" }}>
              This is a social media I been building for the past 2 years
              starting in 2021 when I started attending UC Merced
            </p>
            <span>
              popup overlay with animation to allow users to edit their profiles
            </span>
            <div>
              <img
                src="https://upload-image-demo-fh.s3.amazonaws.com/18c429f606b13bb19a58632642879a9f784fe47bd9e85eefb5f2ea208f7d278e"
                alt=""
                className="myImage"
              />
            </div>
            <br />
            <span>
              user profile, users can see who they are following and who is
              following them as well as the ability to unfollow users
            </span>
            <div>
              <img
                src="https://upload-image-demo-fh.s3.amazonaws.com/0ac66bd4cb740906b380561ef408c517d7f332f8982fc6a5b66be901f06b0943"
                alt=""
                className="myImage"
              />
            </div>
            <br />
            <span>
              This is the homefeeed where users can see their posts and their
              friends posts, uses pagination to load more posts as the user
              scrolls as to not impact loading time and performance
              unfortunately when i was working on the image url generation i
              forgot to remove image url expiration and some of the images are
              no longer available how ever that as been fixed and images will no
              longer expire. The home feed allows nested comments of any depth
              with the ability to insert images, polls, and a message. How ever
              the like button currently doesnt work but wouldnt take long to
              implement
            </span>
            <div>
              <img
                src="https://upload-image-demo-fh.s3.amazonaws.com/b67df1cf8bece68acb2e1994c304a449f58a24ca1b65262d316cc165c6b299bc"
                alt=""
                className="myImage"
              />
              <br />
              <img
                src="https://upload-image-demo-fh.s3.amazonaws.com/422a58ff3bbfa688419993f4042527bb7b609c49d3d336dceac5a44d1723471f"
                alt=""
                className="myImage"
              />
              <br />
              <img
                src="https://upload-image-demo-fh.s3.amazonaws.com/163969a3f8b339e9de7c10facc0c739e3c145987c1a1106c7ad1809f969dfea2"
                alt=""
                className="myImage"
              />
            </div>
            <br />
            <span>
              Another feature is the ability to have direct messages using
              socket.io
            </span>
            <img
              src="
            https://upload-image-demo-fh.s3.amazonaws.com/98888a6a2b2627a82179499218d1ef837de15dbafdebb7e42090485203183c03"
              className="myImage"
            />
            <br />
            <span>
              there are many other features that i didnt go over and that have
              been published yet, for example one feauture that is yet to be
              deployed is email verification which uses the google api
            </span>
            <br />
            <a href="https://react-nodejs-heroku-public.herokuapp.com/">
              react-nodejs-heroku-public
            </a>

            <br />
            <br />
            <div>
              There are many other projects that I have worked on but didnt get
              the time to include here, ill try to update my personal website
              over the break as well as finish many of my unfinished projects
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
