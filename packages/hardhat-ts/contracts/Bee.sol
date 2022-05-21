//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "base64-sol/base64.sol";
import "hardhat/console.sol";
import "./HexStrings.sol";
import "./ToColor.sol";

//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract Bee is ERC721Enumerable, Ownable {
  using Strings for uint256;
  using HexStrings for uint160;
  using ToColor for bytes3;
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  constructor() ERC721("Bee", "BEE") {
    // RELEASE THE BeeS!
  }

  mapping(uint256 => bytes3) public color;
  mapping(uint256 => bytes32) public genes;

  uint256 mintDeadline = block.timestamp + 24 hours;

  function mintItem() public returns (uint256) {
    require(block.timestamp < mintDeadline, "DONE MINTING");
    _tokenIds.increment();

    uint256 id = _tokenIds.current();
    console.log("Minting new bee with id #% ", id);
    // console.log("Gene 0: ", blockhash(block.number - 1));
    console.log("Gene 1: ", msg.sender);
    console.log("Gene 2: ", address(this));
    _mint(msg.sender, id);

    genes[id] = keccak256(
      abi.encodePacked(
        blockhash(block.number - 1),
        // TODO: add size and scale in base
        msg.sender,
        address(this)
      )
    );

    color[id] = bytes2(genes[id][0]) | (bytes2(genes[id][1]) >> 8) | (bytes3(genes[id][2]) >> 16);

    return id;
  }

  function mintItemToHive() public returns (uint256) {
    require(block.timestamp < mintDeadline, "DONE MINTING");
    _tokenIds.increment();

    uint256 id = _tokenIds.current();
    console.log("Minting new bee with id #% ", id);
    // console.log("Gene 0: ", blockhash(block.number - 1));
    console.log("Gene 1: ", msg.sender);
    console.log("Gene 2: ", address(this));
    _mint(msg.sender, id);

    genes[id] = keccak256(
      abi.encodePacked(
        blockhash(block.number - 1),
        // TODO: add size and scale in base
        msg.sender,
        address(this)
      )
    );

    color[id] = bytes2(genes[id][0]) | (bytes2(genes[id][1]) >> 8) | (bytes3(genes[id][2]) >> 16);

    return id;
  }

  function tokenURI(uint256 id) public view override returns (string memory) {
    require(_exists(id), "not exist");
    string memory name = string(abi.encodePacked("Bee #", id.toString()));
    string memory description = string(abi.encodePacked("This Bee has the color #", color[id].toColor()));
    string memory image = Base64.encode(bytes(generateSVGofTokenById(id)));

    return
      string(
        abi.encodePacked(
          "data:application/json;base64,",
          Base64.encode(
            bytes(
              abi.encodePacked(
                "{'name':'",
                name,
                "', 'description':'",
                description,
                "', 'external_url':'https://sting-royale.web.app/external/",
                id.toString(),
                "', 'attributes': [{'trait_type': 'color', 'value': '#",
                color[id].toColor(),
                "'}], 'owner':'",
                (uint160(ownerOf(id))).toHexString(20),
                "', 'image': '",
                "data:image/svg+xml;base64,",
                image,
                "'}"
              )
            )
          )
        )
      );
  }

  function generateSVGofTokenById(uint256 id) internal view returns (string memory) {
    string memory svg = string(
      abi.encodePacked(
        "<svg width=",
        "400",
        " height=",
        "400",
        " viewBox=",
        "0 0 59 59",
        " xmlns=",
        "http://www.w3.org/2000/svg",
        ">",
        renderTokenById(id),
        "</svg>"
      )
    );

    return svg;
  }

  // TODO: kill the bee update image
  // '<filter id="grayscale">',
  //   '<feColorMatrix type="saturate" values="0.10"/>',
  // '</filter>'

  // Visibility is `public` to enable it being called by other contracts for composition.
  function renderTokenById(uint256 id) public view returns (string memory) {
    string memory render = string(
      abi.encodePacked(
        "<defs><style>",
        ".cls-1{fill:#222;}",
        ".cls-2{fill:#",
        color[id].toColor(),
        ";}",
        ".cls-3{opacity:0.3;}",
        ".cls-4{fill:#",
        color[id].toColor(),
        ";}",
        ".cls-5{fill:#fff;}",
        "</style></defs>",
        "<g id='bee' data-name='bee'><path class='cls-1' d='M51.2,48.13,60,59l-13.3-4.3Z'/><path class='cls-2' d='M49.5,28.93l-.2,2.6,1.9-1.8-.6,2.5,2.1-1.6-.8,2.5,2.2-1.4L53,34.13l2.4-1L54,35.23l2.5-.7-1.7,1.9,2.6-.3-2,1.7,2.6.1-2.2,1.4,2.6.5-2.4,1,2.5.8-2.5.8,2.4,1.1-2.6.5,2.2,1.4-2.6.2,2.1,1.6H54.8l1.9,1.9-2.7-.4,1.6,2.1-2.6-.7,1.4,2.2-2.4-.9,1.2,2.3-2.4-1.1.9,2.4-2.3-1.4.7,2.5L48,54.53l.5,2.6-2-1.7.3,2.6L45,56.23v2.6l-1.7-2-.2,2.6-1.5-2.2-.4,2.6L40,57.63l-.6,2.5-1.1-2.4-.8,2.5-1-2.4-1,2.4-.8-2.5-1.1,2.4-.6-2.6-1.3,2.3-.4-2.6-1.5,2.2-.2-2.6-1.7,2v-2.6l-1.8,1.9.3-2.6-2,1.7.5-2.6-2.1,1.6.7-2.5-2.3,1.4.9-2.4-2.4,1.1,1.2-2.3-2.5.9,1.4-2.2-2.6.7Z'/><path class='cls-1' d='M8.5,37.83l36.6-11.9-.5,2.5,2.1-1.6-.8,2.5,2.2-1.4L47,30.33l2.4-1L48,31.53l2.5-.7-1.7,1.9,2.6-.3-2,1.7,2.6.1-2.2,1.3,2.6.5L50,37.13l2.5.8-2.5.8,2.4,1.1-2.6.5,2.2,1.4-2.6.2,2.1,1.6-2.6-.1,1.9,1.9L48,45l1.6,2.1-2.6-.7,1.4,2.2-2.4-.9L47.2,50l-2.4-1.1.9,2.4-2.3-1.4.7,2.5L42,50.83l.5,2.6-2-1.7.3,2.6L39,52.53v2.6l-1.7-2-.2,2.6-1.5-2.2-.4,2.6L34,53.93l-.6,2.6-1.1-2.4-.8,2.5-1-2.4-1,2.4-.8-2.5-1.2,2.4-.6-2.6-1.3,2.3-.4-2.6-1.5,2.2-.2-2.6-1.7,2v-2.6L20,54.53l.3-2.6-2,1.7.5-2.6-2.1,1.6.7-2.5-2.3,1.4.9-2.4-2.4,1.1,1.2-2.3-2.5.9,1.4-2.2-2.6.7,1.6-2.1-2.6.4,1.9-1.9-2.6.1,2.1-1.6L9,41.73l2.2-1.4-2.6-.5,2.4-1.1Z'/><g class='cls-3'><path class='cls-4' d='M58,2.53c-11.52-12-22.69,22.38-22.8,25,0,0,15.5,2.6,20.1-4.7S61.7,7,58,2.53'/><path class='cls-4' d='M1.9,7.13c-3.5,4.3-1.9,12.4,2.6,19.3s19.8,4.3,19.8,4.3c-.2-3-11.11-35.17-22.4-23.6'/></g><path class='cls-2' d='M31.6,23.43l1-1.8.3,2,1.1-1.7.2,2,1.2-1.7.1,2,1.3-1.6-.1,2,1.4-1.5-.3,2,1.6-1.3-.5,2,1.7-1.1-.7,1.9,1.9-.9-1,1.8,2-.7-1.2,1.6,2-.4-1.5,1.5,2.1-.1-1.6,1.2,2.1.2-1.8,1,2,.4L43,33l2,.6-2,.7,1.9.9-2,.5,1.8,1.1-2.1.3,1.7,1.3-2.3.3,1.5,1.4-2.1-.2,1.4,1.6-2-.3,1.2,1.7-2-.6,1,1.8-2-.8.9,1.9-1.9-.9.7,2-1.8-1.1.5,2-1.7-1.3.3,2-1.5-1.4.1,2.1-1.4-1.5-.1,2.1-1.3-1.7-.3,2-1.1-1.8-.5,2-1-1.8-.6,2L27.5,48l-.8,1.9-.6-2-1,1.8-.5-2-1.1,1.8-.3-2-1.1,1.7-.1-2.1-1.4,1.5.1-2.1-1.5,1.4.3-2-1.7,1.3.5-2-1.8,1.1.7-2-1.9.9.9-1.9-2,.7,1-1.8-2,.6Z'/><path class='cls-1' d='M7.9,31.33l1.7-.6-1.7-.8,1.8-.4-1.6-.9,1.8-.3-1.5-1.1h1.9L9,25.93l1.8.2-1.1-1.4,1.8.5-.9-1.6,1.7.7-.7-1.7,1.6.9-.5-1.8,1.5,1.1L13.9,21l1.3,1.2-.2-1.8,1.2,1.4V20l1.1,1.5.1-1.8,1,1.5.3-1.8.9,1.6.4-1.8.8,1.7.5-1.8.7,1.7.6-1.8.6,1.7.6-1.7.6,1.8.7-1.7.5,1.8.8-1.7.4,1.8.9-1.6.3,1.8,1-1.5.1,1.8L30.2,20v1.7l1.2-1.4-.3,1.9,1.3-1.3-.3,1.9,1.4-1.1-.5,1.7,1.6-.9-.8,1.7,1.7-.7-.9,1.6,1.7-.5-1.1,1.5,1.8-.2-1.4,1.3h1.8l-1.5,1.1,1.8.2-1.6.9,1.7.4-1.6.8,1.7.6-1.7.7,1.6.8-1.7.5,1.5,1-1.8.3,1.5,1.1-1.8.2,1.4,1.3H35.1l1.2,1.4-1.8-.2,1.1,1.5-1.8-.4,1,1.6-1.7-.6.8,1.7-1.7-.7.7,1.8-1.6-.9.5,1.8-1.6-.9.3,1.9-1.4-1.2.2,1.9L28,44.53v2L26.8,45l-.2,1.9-1-1.6-.4,1.9-.9-1.7-.6,1.8-.7-1.7-.7,1.8-.6-1.8-.9,1.6-.4-1.9-1,1.6L19.2,45,18,46.43v-1.9l-1.3,1.3.2-1.9-1.5,1.3.3-1.9-1.5,1.1.5-1.8-1.7.8.7-1.8-1.7.7.8-1.7-1.7.6,1-1.6-1.8.4,1.1-1.5-1.8.2,1.3-1.4H9.1L10.5,36l-1.8-.2,1.5-1.1-1.8-.3,1.6-1-1.8-.5,1.7-.8Z'/><path class='cls-5' d='M15.4,25.33c7-.1,7,10.9,0,10.8C8.4,36.23,8.4,25.23,15.4,25.33Z'/><path class='cls-5' d='M23.11,26.42c6.31-3.05,11,6.92,4.56,9.79C21.37,39.26,16.72,29.29,23.11,26.42Z'/><path class='cls-1' d='M34.3,15.13c-6.66-1.34-12.79,7.59-9.3,6.3,1.3-2.6,3.5-5.6,9.3-5.3a.5.5,0,1,0,0-1'/><path class='cls-1' d='M15.8,22.53c-3.77-5.71-14.55-3.45-11.1-2,2.8-.9,6.4-1.5,10.3,2.8h0c.6.3,1.3-.4.8-.8'/><path class='cls-1' d='M16.5,28.13c4-.06,4,6.26,0,6.2S12.48,28.07,16.5,28.13Z'/><path class='cls-1' d='M22.94,28.33c3.85-1.87,6.61,4,2.7,5.8S19,30.08,22.94,28.33Z'/></g>"
      )
    );

    return render;
  }

  function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
    if (_i == 0) {
      return "0";
    }
    uint256 j = _i;
    uint256 len;
    while (j != 0) {
      len++;
      j /= 10;
    }
    bytes memory bstr = new bytes(len);
    uint256 k = len;
    while (_i != 0) {
      k = k - 1;
      uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
      bytes1 b1 = bytes1(temp);
      bstr[k] = b1;
      _i /= 10;
    }
    return string(bstr);
  }
}
