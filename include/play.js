const ytdlDiscord = require('ytdl-core-discord');
const { MessageEmbed } = require('discord.js');

const { canModifyQueue } = require('../util/vc');

module.exports = {
  async play(song, message) {
    let config;

    try {
      config = require('../config.json');
    } catch (error) {
      config = null;
    }

    const PRUNING = config ? config.PRUNING : process.env.PRUNING;
    const queue = message.client.queue.get(message.guild.id);

    if (!song) {
      queue.channel.leave();
      message.client.queue.delete(message.guild.id);
      let playQueueEnd = new MessageEmbed()
        .setTitle('❌ Music queue ended.')
        .setColor('#2ED8BA')
        .setTimestamp();
      return queue.textChannel.send(playQueueEnd).catch(console.error);
    }

    let stream = null;
    let streamType = song.url.includes('youtube.com') ? 'opus' : 'ogg/opus';

    try {
      if (song.url.includes('youtube.com')) {
        stream = await ytdlDiscord(song.url, { highWaterMark: 1 << 25 });
      }
    } catch (error) {
      if (queue) {
        queue.songs.shift();
        module.exports.play(queue.songs[0], message);
      }

      console.error(error);
      return message.channel.send(
        `Error: ${error.message ? error.message : error}`
      );
    }

    queue.connection.on('disconnect', () =>
      message.client.queue.delete(message.guild.id)
    );

    const dispatcher = queue.connection
      .play(stream, { type: streamType })
      .on('finish', () => {
        if (collector && !collector.ended) collector.stop();

        if (queue.loop) {
          // if loop is on, push the song back at the end of the queue
          // so it can repeat endlessly
          let lastSong = queue.songs.shift();
          queue.songs.push(lastSong);
          module.exports.play(queue.songs[0], message);
        } else {
          // Recursively play the next song
          queue.songs.shift();
          module.exports.play(queue.songs[0], message);
        }
      })
      .on('error', (err) => {
        console.error(err);
        queue.songs.shift();
        module.exports.play(queue.songs[0], message);
      });
    dispatcher.setVolumeLogarithmic(queue.volume / 100);

    try {
      let playMsg = new MessageEmbed()
        .setTitle(`🎶 Started playing: **${song.title}**`)
        .setColor('#2ED8BA')
        .setTimestamp();
      var playingMessage = await queue.textChannel.send(playMsg);
      // await playingMessage.react('⏭');
      // await playingMessage.react('⏯');
      // await playingMessage.react('🔇');
      // await playingMessage.react('🔉');
      // await playingMessage.react('🔊');
      // await playingMessage.react('🔁');
      // await playingMessage.react('⏹');
    } catch (error) {
      console.error(error);
    }

    const filter = (reaction, user) => user.id !== message.client.user.id;
    var collector = playingMessage.createReactionCollector(filter, {
      time: song.duration > 0 ? song.duration * 1000 : 600000,
    });

    collector.on('collect', (reaction, user) => {
      if (!queue) return;
      const member = message.guild.member(user);

      switch (reaction.emoji.name) {
        case '⏭':
          queue.playing = true;
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          queue.connection.dispatcher.end();
          let playSkip = new MessageEmbed()
            .setTitle(`${user} ⏩ skipped the song`)
            .setColor('#2ED8BA')
            .setTimestamp();
          queue.textChannel.send(playSkip).catch(console.error);
          collector.stop();
          break;

        case '⏯':
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          if (queue.playing) {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.pause(true);
            let playPause = new MessageEmbed()
              .setTitle(`${user} ⏸ paused the music.`)
              .setColor('#2ED8BA')
              .setTimestamp();
            queue.textChannel.send(playPause).catch(console.error);
          } else {
            queue.playing = !queue.playing;
            queue.connection.dispatcher.resume();
            let playResume = new MessageEmbed()
              .setTitle(`${user} ▶ resumed the music!`)
              .setColor('#2ED8BA')
              .setTimestamp();
            queue.textChannel.send(playResume).catch(console.error);
          }
          break;

        case '🔇':
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          if (queue.volume <= 0) {
            queue.volume = 100;
            queue.connection.dispatcher.setVolumeLogarithmic(100 / 100);
            let playUnmute = new MessageEmbed()
              .setTitle(`${user} 🔊 unmuted the music!`)
              .setColor('#2ED8BA')
              .setTimestamp();
            queue.textChannel.send(playUnmute).catch(console.error);
          } else {
            queue.volume = 0;
            queue.connection.dispatcher.setVolumeLogarithmic(0);
            let playMute = new MessageEmbed()
              .setTitle(`${user} 🔇 muted the music!`)
              .setColor('#2ED8BA')
              .setTimestamp();
            queue.textChannel.send(playMute).catch(console.error);
          }
          break;

        case '🔉':
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member) || queue.volume == 0) return;
          if (queue.volume - 10 <= 0) queue.volume = 0;
          else queue.volume = queue.volume - 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          let playVDec = new MessageEmbed()
            .setTitle(
              `${user} 🔉 decreased the volume, the volume is now ${queue.volume}%`
            )
            .setColor('#2ED8BA')
            .setTimestamp();
          queue.textChannel.send(playVDec).catch(console.error);
          break;

        case '🔊':
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member) || queue.volume == 100) return;
          if (queue.volume + 10 >= 100) queue.volume = 100;
          else queue.volume = queue.volume + 10;
          queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
          let playVInc = new MessageEmbed()
            .setTitle(
              `${user} 🔊 increased the volume, the volume is now ${queue.volume}%`
            )
            .setColor('#2ED8BA')
            .setTimestamp();
          queue.textChannel.send(playVInc).catch(console.error);
          break;

        case '🔁':
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          queue.loop = !queue.loop;
          let playLoop = new MessageEmbed()
            .setTitle(`Loop is now ${queue.loop ? '**on**' : '**off**'}`)
            .setColor('#2ED8BA')
            .setTimestamp();
          queue.textChannel.send(playLoop).catch(console.error);
          break;

        case '⏹':
          reaction.users.remove(user).catch(console.error);
          if (!canModifyQueue(member)) return;
          queue.songs = [];
          let playStop = new MessageEmbed()
            .setTitle(`${user} ⏹ stopped the music!`)
            .setColor('#2ED8BA')
            .setTimestamp();
          queue.textChannel.send(playStop).catch(console.error);
          try {
            queue.connection.dispatcher.end();
          } catch (error) {
            console.error(error);
            queue.connection.disconnect();
          }
          collector.stop();
          break;

        default:
          reaction.users.remove(user).catch(console.error);
          break;
      }
    });

    collector.on('end', () => {
      playingMessage.reactions.removeAll().catch(console.error);
      if (
        PRUNING === true ||
        (PRUNING == 'true' && playingMessage && !playingMessage.deleted)
      ) {
        playingMessage.delete({ timeout: 3000 }).catch(console.error);
      }
    });
  },
};
