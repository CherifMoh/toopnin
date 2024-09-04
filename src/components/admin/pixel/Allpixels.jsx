
import axios from 'axios';
import PixelScript from './PixelScript'

async function fetchPixels() {
    const res = await axios.get('https://toopnin.com/api/pixel');
    return res.data;
}

async function Allpixels() {

    let Pixels

    try{
        Pixels = await fetchPixels()
    }catch (err) {
        console.log(err)
    }

    console.log(Pixels)



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