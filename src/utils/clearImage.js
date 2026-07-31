import fs from "fs";
import path from "path";

/**
 * Deletes a file from the disk given its relative path.
 * @param {string} filePath - The relative path of the file to delete (e.g., 'images/filename.png')
 */
const clearImage = (filePath) => {
    if (!filePath) return;

    const absolutePath = path.join(process.cwd(), filePath);

    fs.unlink(absolutePath, (err) => {
        if (err && err.code !== "ENOENT") {
            console.error(`Failed to delete image at ${absolutePath}:`, err);
        }
    });
};

export default clearImage;
