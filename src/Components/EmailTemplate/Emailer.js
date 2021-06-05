export const EmailTemplate = (emailConfig) => {
    const { heading, subHeading, content, bodyFooterText } = emailConfig;
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>${heading}</title>
        <style>
            html, body {
                margin: 0;
                padding: 0;
                height: 100%;
                min-height: 100%;
                box-sizing: border-box;
            }
            .t-ac{
                text-align:center;
            }
            .mainEmailWrap {
                position: relative;
                max-width: 600px;
                height: 95%;
                margin: 10px auto;
                display: flex;
                box-sizing: border-box;
                flex-direction: column;
                justify-content: flex-start;
                border: 1px solid #6b6b6b;
            }
            .emailHead {
                width: 100%;
                height: 150px;
                position: relative;
            }
            .emailHead img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .emailHead .logoWrap {
                width: 250px;
                height: 90px;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            .emailHead .logoWrap img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            .innerEmailWrap {
                width: 100%;
                box-sizing: border-box;
                padding: 0 15px;
                font-family: Arial, Helvetica, sans-serif;
            }
            .innerEmailWrap h1, 
            .innerEmailWrap h2 {
                text-align: center;
                font-size: 20px;
                line-height: 22px;
                color: #512da8;
                font-weight: 500;
                margin: 20px auto 0;
                letter-spacing: 0.5px;
            }
            .innerEmailWrap h2 {
                font-size: 16px;
                line-height: 18px;
                color: #2d2d2d;
            }
            .innerEmailWrap .content-wrap {
                margin: 40px auto 20px;
                font-size: 14px;
                line-height: 18px;
                color: #2d2d2d;
                text-align: center;
            }

            .innerEmailWrap .action-btn-wrap {
                text-align: center;
                margin: 30px auto;
            }

            .innerEmailWrap .action-btn-wrap .action { 
                border: 1px solid #069ce5;
                display: inline-block;
                padding: 10px 20px;
                border-radius: 5px;
                text-decoration: none;
                color: white;
                background-color: #039be5;
                font-size: 15px;
                letter-spacing: 0.5px;
                font-weight: 500;
            }
            .body-footer-text {
                font-size: 10px;
                font-weight: 600;
                line-height: 16px;
                text-transform: uppercase;
                color: #7a7a7a;
            }
            .footer {
                background-color: #333333;
                padding: 10px;
                color: #ebefef;
                font-size: 14px;
                text-align: center;
                margin-top: auto;
            }
            .footer a {
                color: #039be5;
                font-family: Arial, Helvetica, sans-serif;
                text-decoration: none;
            }
            .footer .footer-links-wrap {
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 6px 0;
            }
            .footer .link {
                padding: 0px 10px;
                border-right: 1px solid white;
                font-size: 11px;
                letter-spacing: 0.5px;
            }
            .footer .link:last-child {
                border-right: unset;
              }
        </style>
    </head>
    <body>
        <div class="mainEmailWrap">
            <div class="emailHead">
                <img src="https://i.imgur.com/IBHgHPF.jpeg" alt="dance image" />
                <div class="logoWrap">
                    <img src="https://boogalusite.web.app/static/media/Boogalu-logo.cb3774a0.svg" alt="Boogalu" />
                </div>
            </div>
            <div class="innerEmailWrap">

                <!-- When user register this will be the message and different email title will be the name of the user -->
                ${heading ? '<h1>' + heading + '</h1>' : ''}

                <!-- This is sub-heading, we can use when needed -->
                ${subHeading ? '<h2>' + subHeading + '</h2>' : ''}
        
                <!-- Paragraph for dynamic messages for user -->
                ${content ? '<div class="content-wrap">' + content + '</div>' : ''}

                <!-- Paragraph for dynamic body footer content -->
                ${bodyFooterText ? '<div class="body-footer-text">' + bodyFooterText + '</div>' : ''}
            </div>
    
            <!--Text for footer -->
            <div class="footer">
                <div class="footer-links-wrap">
                    <div class="link">
                        <a href=${window.location.origin}>HOME</a>
                    </div>
                    <div class="link">
                        <a href=${window.location.origin + '/lessons'}>LESSONS</a>
                    </div>
                    <div class="link">
                        <a href=${window.location.origin + '/competitions'}>COMPETITIONS</a>
                    </div>
                    <div class="link">
                        <a href=${window.location.origin + '/subscription'}>SUBSCRIPTIONS</a>
                    </div>
                </div>
                &copy; All right reserved. <a href="https://boogalusite.web.app/" target="_blank">Boogalu Pvt. Ltd.</a>
            </div>
        </div>
    </body>
    </html>`
};