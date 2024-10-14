
import axios from 'axios';
import PixelScript from './PixelScript'
import https from 'https';

async function fetchPixels() {
    const agent = new https.Agent({  
        rejectUnauthorized: false
    });
    const res = await axios.get('https://toopnin.com/api/pixel/fb', {
        httpsAgent: agent
    });
    return res.data;
}

async function Allpixels() {

    let Pixels

    try{
        Pixels = await fetchPixels()
    }catch (err) {
        console.log(err)
    }




    const pixelIdsElement = Pixels?.map(pixel=>{
        return (
            <PixelScript id={pixel.pixelID} key={pixel.pixelID} />
        )
    })

  return (
    pixelIdsElement
  )
}

export default Allpixels