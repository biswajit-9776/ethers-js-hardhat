const {ethers} = require("hardhat")
const {assert, expect} = require("chai")

describe("SimpleStorage", async function() {
    let simpleStorageFactory, simpleStorage
    beforeEach("Deploying contract", async function() {
        simpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
        simpleStorage = await simpleStorageFactory.deploy()
    })

    it("Get favorite number", async function() {
        const favoriteNumber = await simpleStorage.retrieve()
        const expectedFavoriteNumber = "0"
        assert.equal(favoriteNumber.toString(), expectedFavoriteNumber)
    })
})