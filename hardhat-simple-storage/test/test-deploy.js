const { ethers } = require("hardhat")
const { assert, expect } = require("chai")

describe("SimpleStorage", async function () {
    let simpleStorageFactory, simpleStorage
    beforeEach("Deploying contract", async function () {
        simpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
        simpleStorage = await simpleStorageFactory.deploy()
    })

    it("Get favorite number", async function () {
        const favoriteNumber = await simpleStorage.retrieve()
        const expectedFavoriteNumber = "0"
        assert.equal(favoriteNumber.toString(), expectedFavoriteNumber)
    })

    it("Should update when we call store", async function () {
        const expectedFavoriteNumber = "7"
        const transactionResponse = await simpleStorage.store(
            expectedFavoriteNumber,
        )
        await transactionResponse.wait(1)
        const updatedFavoriteNumber = await simpleStorage.retrieve()
        assert.equal(updatedFavoriteNumber.toString(), expectedFavoriteNumber)
    })

    it("Add a person struct", async function () {
        const name = "Patrick Collins"
        const favoriteNumber = "11"
        const transactionResponse = await simpleStorage.addPerson(
            name,
            favoriteNumber,
        )
        await transactionResponse.wait(1)
        const [actualFvoriteNumber, actualName] = await simpleStorage.people(0)
        assert.equal(actualName, name)
        assert.equal(actualFvoriteNumber.toString(), favoriteNumber)
    })
})
