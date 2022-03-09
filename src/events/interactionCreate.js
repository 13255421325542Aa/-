const { Client, Interaction, MessageEmbed } = require("discord.js");
const replys = require("../modules/replys.json");
const db = require("quick.db");
const { events: player } = require("../clients/player");

/**
 *
 * @param {Client} client
 * @param {Interaction<import("discord.js").CacheType>} interaction
 */

module.exports = async (client, interaction) => {
  if (interaction.isCommand()) {
    try {
      if (interaction.channel.type == "DM")
        return interaction.reply({
          ephemeral: true,
          content: replys.cantUseInDM,
        });
      let command = require("../commands/" + interaction.commandName);
      await interaction
        .deferReply({
          ephemeral: true,
          fetchReply: true,
        })
        .catch(() => {});
      if (command) command.run(client, interaction);
    } catch (err) {
      return;
    }
  }
};
