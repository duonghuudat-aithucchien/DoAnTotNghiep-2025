// import React from 'react'

// const LikeButtonComponent = (props) => {
//     const {dataHref} = props
//   return (
//     <div style={{marginTop: '8px'}}>
//         <div class="fb-like" data-href={dataHref} data-width="" data-layout="" data-action="" data-size="" data-share="true"></div>
//     </div>
//   )
// }

// export default LikeButtonComponent
import React, { useEffect } from 'react';

const LikeButtonComponent = ({ dataHref }) => {
  useEffect(() => {
    // Khi SDK đã tải xong
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, []);

  return (
    <div style={{ marginTop: '8px' }}>
      <div
        className="fb-like"
        data-href={dataHref}
        data-width=""
        data-layout="standard"
        data-action="like"
        data-size="small"
        data-share="true"
      ></div>
    </div>
  );
};

export default LikeButtonComponent;
