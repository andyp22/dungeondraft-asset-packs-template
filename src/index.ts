import { promises as fs } from "fs";
import * as path from "path";

interface TagsData {
  fileList: any;
  fullList: string[];
}

const dataObj = {};
const fullList: string[] = [];

const walkDirectory = async function (
  dir,
  parentObjectName,
  parenttags,
): Promise<TagsData> {
  // Read the directory
  console.log(dir, parentObjectName, parenttags);
  const list = await fs.readdir(dir);
  for (let i = 0; i < list.length; i++) {
    const fileName = list[i];
    const filePath = path.resolve(dir, fileName);
    const stat = await fs.stat(filePath);
    const formattedFileName = `${fileName.replaceAll("_", " ").trim()}`;
    const formattedParentObjectName = `${parentObjectName.replaceAll("_", " ").trim()}`;
    const currentTags = [formattedParentObjectName];

    if (stat && stat.isDirectory()) {
      for (let i = 0; i < parenttags.length; i++) {
        currentTags.push(parenttags[i]);
      }

      dataObj[formattedFileName] = [];
      await walkDirectory(filePath, fileName, currentTags);
    } else {
      const imagePath = filePath
        .substring(filePath.indexOf("textures"))
        .replaceAll("\\", "/");

      // Check to see if the parent object has already been created
      if (!dataObj[formattedParentObjectName]) {
        // Create it if not
        dataObj[formattedParentObjectName] = [];
      }

      // Add the file to the parent object
      dataObj[formattedParentObjectName].push(imagePath);

      // Also include this item with each parent tag
      for (let i = 0; i < parenttags.length; i++) {
        // Check to see if the parent tag object has already been created
        if (!dataObj[parenttags[i]]) {
          // Create it if not
          dataObj[parenttags[i]] = [];
        }

        dataObj[parenttags[i]].push(imagePath);
      }

      // If the file is not already part of the full list of tags, add it
      if (!fullList.includes(formattedParentObjectName))
        fullList.push(formattedParentObjectName);
    }
  }

  return new Promise((resolve) => {
    // Remove any empty objects
    for (const tagList in dataObj) {
      if (dataObj[tagList].length == 0) delete dataObj[tagList];
    }
    resolve({ fileList: dataObj, fullList: fullList });
  });
};

async function buildObjectTags(startingDirPath, startingDirName) {
  const formattedDirName = startingDirName.replaceAll("_", " ").trim();
  dataObj[formattedDirName] = [];
  const { fileList, fullList } = await walkDirectory(
    `./${startingDirPath}/textures/objects/${startingDirName}`,
    startingDirName,
    [],
  );

  const fileData = {
    tags: fileList,
    sets: {},
  };

  fileData.sets[`${formattedDirName} Set`] = fullList;

  fs.writeFile(
    `./${startingDirPath}/data/default.dungeondraft_tags`,
    JSON.stringify(JSON.parse(JSON.stringify(fileData))),
  );

  console.log("Completed building pack tag data for: ", startingDirName);
}

function main() {
  // TODO: This should be based on directory structure and pulled in automatically
  // based on whether the directory has "_pack" at the end of the name
  const packages = [
    {
      dirPath: "example_pack",
      dirName: "Sample",
    },
  ];

  packages.forEach((pack) => {
    console.log("Building pack tag data: ", pack.dirName);
    buildObjectTags(pack.dirPath, pack.dirName);
  });
}

main();
