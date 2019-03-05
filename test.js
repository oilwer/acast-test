var IndexFunctions = require('./index.js');
var expect = require('chai').expect;
var should = require('chai').should();

describe("index tests", () => {
  describe("fetchRssFeed function", () => {
    it("Should be an RSS Feed with Items", async () => {
      const feed = await IndexFunctions.fetchRssFeed("https://rss.acast.com/ftnewsbriefing");
		  should.exist(feed);
		  should.exist(feed.items);
		  feed.should.be.an('object');
    })
  })

  describe("createMp3Checksum function", () => {
    it("Should generate a Checksum based on the Mp3 Url", async () => {
      const checksum = await IndexFunctions.createMp3Checksum("https://media.acast.com/ftnewsbriefing/tuesday-march5/media.mp3");
		  should.exist(checksum);
		  checksum.should.be.an('string');
			expect(checksum).to.have.lengthOf(32);
    })
  })
})
