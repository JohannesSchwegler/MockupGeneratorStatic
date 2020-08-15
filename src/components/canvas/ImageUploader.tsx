import React, { useState } from 'react'
import ImageUploader from "react-images-upload";

import s from "./ImageUploader.scss"

export default function ImageUpload(props: any) {
    const [pictures, setPictures] = useState([] as any);

    const onDrop = (picture: any) => {
        setPictures([...pictures, picture]);
    };
    return (
        <ImageUploader
            className={s.uploader}
            {...props}
            withIcon={true}
            onChange={onDrop}
            withPreview={true}
            imgExtension={[".jpg", ".gif", ".png", ".gif"]}
            maxFileSize={5242880}
        />
    );

}
