pragma solidity ^0.8.4;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "base64-sol/base64.sol";
import "./HexStrings.sol";
import "hardhat/console.sol";

abstract contract BeeABI {
  mapping(uint256 => bytes32) public genes;

  function renderTokenById(uint256 id) external view virtual returns (string memory);

  function transferFrom(
    address from,
    address to,
    uint256 id
  ) external virtual;
}

contract Hive is ERC721Enumerable, IERC721Receiver {
  using Strings for uint256;
  using Strings for uint8;
  using HexStrings for uint160;
  using Counters for Counters.Counter;

  // uint256 private nonce = 0;
  // uint256 public prize = 0;
  // uint256 public lastRoll;

  // event Roll(address indexed player, uint256 roll);
  // event Winner(address winner, uint256 amount);

  // function rollTheDice() public payable {
  //     prize += msg.value;
  //     bytes32 prevHash = blockhash(block.number - 1);
  //     bytes32 hash = keccak256(abi.encodePacked(prevHash, address(this), nonce));
  //     uint256 roll = numberRolled(hash);
  //     lastRoll = roll;
  //     nonce++;

  //     emit Roll(msg.sender, roll);

  //     if (roll != 0) {
  //         return;
  //     }

  //     uint256 amount = prize;
  //     prize = 0;
  //     (bool sent, ) = msg.sender.call{value: amount}("");
  //     require(sent, "Failed to send Ether");
  //     emit Winner(msg.sender, amount);
  // }

  // function numberRolled(bytes32 data) internal pure returns (uint256) {
  //     return uint256(data) % 16;
  // }

  Counters.Counter private _tokenIds;

  BeeABI bees;
  mapping(uint256 => uint256[]) beesById;

  constructor(address _bees) ERC721("Hive", "BEEHIVE") {
    bees = BeeABI(_bees);
  }

  function mintItem() public returns (uint256) {
    _tokenIds.increment();

    uint256 id = _tokenIds.current();
    _mint(msg.sender, id);

    return id;
  }

  function returnAllBees(uint256 _id) external {
    require(msg.sender == ownerOf(_id), "only hive owner can return the bees");
    for (uint256 i = 0; i < beesById[_id].length; i++) {
      bees.transferFrom(address(this), ownerOf(_id), beesById[_id][i]);
    }

    delete beesById[_id];
  }

  function tokenURI(uint256 id) public view override returns (string memory) {
    require(_exists(id), "not exist");
    string memory name = string(abi.encodePacked("Hive #", id.toString()));
    string memory description = string(abi.encodePacked("Hive"));
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
                "', 'external_url':'https://sting-royale.web.app/token/",
                id.toString(),
                "', 'owner':'",
                (uint160(ownerOf(id))).toHexString(20),
                "', 'image': '",
                "data:image/svg+xml;base64,",
                image,
                "}"
              )
            )
          )
        )
      );
  }

  function generateSVGofTokenById(uint256 id) internal view returns (string memory) {
    string memory svg = string(
      abi.encodePacked("<svg width=", "270", " height=", "270", " xmlns=", "http://www.w3.org/2000/svg", ">", renderTokenById(id), "</svg>")
    );

    return svg;
  }

  // TODO: add hive hex instead of rect
  // Visibility is `public` to enable it being called by other contracts for composition.
  function renderTokenById(uint256 id) public view returns (string memory) {
    string memory render = string(
      abi.encodePacked(
        "<rect x='0' y='0' width='270' height='270' stroke='black' fill='#8FB9EB' stroke-width='5'/>",
        // - (0.3, the scaling factor) * bee head's (cx, cy).
        // Without this, the bees move in rectangle translated towards bottom-right.
        "<g transform='translate(-60 -62)'>",
        renderBees(id),
        "</g>"
      )
    );

    return render;
  }

  function renderBees(uint256 _id) internal view returns (string memory) {
    string memory beeSVG = "";
    console.log("rendering bees of hive #%", _id);
    for (uint8 i = 0; i < beesById[_id].length; i++) {
      uint16 blocksTraveled = uint16((block.number - blockAdded[beesById[_id][i]]) % 256);
      int8 speedX = int8(uint8(bees.genes(beesById[_id][i])[0]));
      int8 speedY = int8(uint8(bees.genes(beesById[_id][i])[1]));

      uint8 newX;
      uint8 newY;

      newX = newPos(speedX, blocksTraveled, x[beesById[_id][i]]);

      newY = newPos(speedY, blocksTraveled, y[beesById[_id][i]]);

      beeSVG = string(
        abi.encodePacked(
          beeSVG,
          "<g>",
          "<animateTransform attributeName='transform' dur='1500s' fill='freeze' type='translate' additive='sum' ",
          "values='",
          newX.toString(),
          " ",
          newY.toString(),
          ";"
        )
      );

      for (uint8 j = 0; j < 100; j++) {
        newX = newPos(speedX, 1, newX);
        newY = newPos(speedY, 1, newY);

        beeSVG = string(abi.encodePacked(beeSVG, newX.toString(), " ", newY.toString(), ";"));
      }

      beeSVG = string(
        abi.encodePacked(
          beeSVG,
          "'/>",
          "<animateTransform attributeName='transform' type='scale' additive='sum' values='0.3 0.3'/>",
          bees.renderTokenById(beesById[_id][i]),
          "</g>"
        )
      );
    }

    return beeSVG;
  }

  function newPos(
    int8 speed,
    uint16 blocksTraveled,
    uint8 initPos
  ) internal pure returns (uint8) {
    uint16 traveled;
    uint16 start;

    if (speed >= 0) {
      // console.log("speed", uint8(speed).toString());
      traveled = uint16((blocksTraveled * uint8(speed)) % 256);
      start = (initPos + traveled) % 256;
      // console.log("start", start.toString());
      // console.log("end", end.toString());
      return uint8(start);
    } else {
      // console.log("speed", uint8(-speed).toString());
      traveled = uint16((blocksTraveled * uint8(-speed)) % 256);
      start = (255 - traveled + initPos) % 256;

      // console.log("start", start.toString());
      // console.log("end", end.toString());
      return uint8(start);
    }
  }

  // https://github.com/GNSPS/solidity-bytes-utils/blob/master/contracts/BytesLib.sol#L374
  function toUint256(bytes memory _bytes) internal pure returns (uint256) {
    require(_bytes.length >= 32, "toUint256_outOfBounds");
    uint256 tempUint;

    assembly {
      tempUint := mload(add(_bytes, 0x20))
    }

    return tempUint;
  }

  mapping(uint256 => uint8) x;
  mapping(uint256 => uint8) y;

  mapping(uint256 => uint256) blockAdded;

  // to receive ERC721 tokens
  // bytes calldata hiveIdData
  function onERC721Received(
    address operator,
    address from,
    uint256 beeTokenId,
    bytes calldata hiveIdData
  )
    external
    override
    returns (
      // bytes calldata hiveIdData
      // bytes calldata hiveIdData
      bytes4
    )
  {
    uint256 hiveId = toUint256(hiveIdData);

    // TODO: check if open, add some lock, timelock?
    // require(ownerOf(hiveId) == from, "you can only add bees to a hive you own.");
    require(beesById[hiveId].length < 256, "hive has reached the max limit of 255 bees.");

    beesById[hiveId].push(beeTokenId);

    bytes32 randish = keccak256(abi.encodePacked(blockhash(block.number - 1), from, address(this), beeTokenId, hiveIdData));
    x[beeTokenId] = uint8(randish[0]);
    y[beeTokenId] = uint8(randish[1]);
    blockAdded[beeTokenId] = block.number;

    return this.onERC721Received.selector;
  }
}
