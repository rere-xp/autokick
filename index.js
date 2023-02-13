const fs = require("fs")
const pino = require("pino")
const baileys = require("@adiwajshing/baileys")
const { Boom } = require("@hapi/boom")
const { state, saveState } = baileys.useSingleFileAuthState("session.json")

const store = baileys.makeInMemoryStore({
	logger: pino().child({
		level: "silent",
		stream: "store"
	})
})


async function startBotAutoKick() {
	const { version, isLatest } = await baileys.fetchLatestBaileysVersion()
	const Ahok = baileys.default({
		version,
		auth: state,
		printQRInTerminal: true,
		browser: ["WhatsApp Bot", "safari", "1.0.0"],
		logger: pino({
			level: "silent"
		})
	})
	
	store.bind(Ahok.ev)
	Ahok.ev.on("creds.update", saveState)
	
	Ahok.ev.on("messages.upsert", async (chatUpdate) => {
		try {
			mek = chatUpdate.messages[0]
			if (!mek.message) return
			if (!mek.key.remoteJid.endsWith("@g.us")) return
			mek.message = (Object.keys(mek.message)[0] === "ephemeralMessage") ? mek.message.ephemeralMessage.message : mek.message
			
			const from = mek.key.remoteJid
			const senderName = mek.pushName
			const type = baileys.getContentType(mek.message)
			const sender = Ahok.decodeJid(mek.key.participant)
			const botNumber = Ahok.decodeJid(Ahok.user.id)
			
			const groupMetadata = await Ahok.groupMetadata(from)
			const groupName = groupMetadata.subject
			const participants = await groupMetadata.participants
			const groupAdmins = await Ahok.getGroupAdmins(participants)
			
			const isBotAdmins = groupAdmins.includes(botNumber) || false
			const isAdmins = groupAdmins.includes(sender) || false
			
			if (!isBotAdmins) return
			if (isAdmins) return
			
			const body = await (type === "conversation") ? mek.message.conversation : (type === "imageMessage") ? mek.message.imageMessage.caption : (type === "videoMessage") ? mek.message.videoMessage.caption : (type === "extendedTextMessage") ? mek.message.extendedTextMessage.text : ""
			const kata = /http|https|co.id|.com|.xyz|.biz|wa.me|t.me|mediafire|chat.whatsapp.com|.ru|.re|.yt|order|ready|open|vcs|readi/i
			const cek = await kata.exec(body)
			if (cek) {
				await Ahok.sendMessage(from, {
					delete: {
						remoteJid: mek.key.remoteJid,
						fromMe: mek.key.fromMe,
						id: mek.key.id,
						participant: mek.key.participant
					}
				})
				Ahok.groupParticipantsUpdate(from, [sender], "remove")
				console.log("[ ! ]", senderName, "Mengirim kata terlarang di", groupName)
			}
			
			if (type == undefined) {
				await Ahok.sendMessage(from, {
					delete: {
						remoteJid: mek.key.remoteJid,
						fromMe: mek.key.fromMe,
						id: mek.key.id,
						participant: mek.key.participant
					}
				})
				console.log("[ ! ]", senderName, "Mengirim pesan undefined di", groupName)
			} else if (type === "audioMessage") {
				await Ahok.sendMessage(from, {
					delete: {
						remoteJid: mek.key.remoteJid,
						fromMe: mek.key.fromMe,
						id: mek.key.id,
						participant: mek.key.participant
					}
				})
				console.log("[ ! ]", senderName, "Mengirim pesan suara di", groupName)
			} else if (type === "documentMessage") {
				await Ahok.sendMessage(from, {
					delete: {
						remoteJid: mek.key.remoteJid,
						fromMe: mek.key.fromMe,
						id: mek.key.id,
						participant: mek.key.participant
					}
				})
				console.log("[ ! ]", senderName, "Mengirim dokumen di", groupName)
			} else if (type === "contactMessage") {
				await Ahok.sendMessage(from, {
					delete: {
						remoteJid: mek.key.remoteJid,
						fromMe: mek.key.fromMe,
						id: mek.key.id,
						participant: mek.key.participant
					}
				})
				console.log("[ ! ]", senderName, "Mengirim kontak di", groupName)
			} else if (type === "contactsArrayMessage") {
				await Ahok.sendMessage(from, {
					delete: {
						remoteJid: mek.key.remoteJid,
						fromMe: mek.key.fromMe,
						id: mek.key.id,
						participant: mek.key.participant
					}
				})
				console.log("[ ! ]", senderName, "Mengirim spam kontak di", groupName)
			} else if (type === "pollCreationMessage") {
				await Ahok.sendMessage(from, {
					delete: {
						remoteJid: mek.key.remoteJid,
						fromMe: mek.key.fromMe,
						id: mek.key.id,
						participant: mek.key.participant
					}
				})
				console.log("[ ! ]", senderName, "Mengirim polling di", groupName)
			} else if (type === "liveLocationMessage") {
				await Ahok.sendMessage(from, {
					delete: {
						remoteJid: mek.key.remoteJid,
						fromMe: mek.key.fromMe,
						id: mek.key.id,
						participant: mek.key.participant
					}
				})
				console.log("[ ! ]", senderName, "Mengirim live lokasi di", groupName)
			} else if (type === "locationMessage") {
				await Ahok.sendMessage(from, {
					delete: {
						remoteJid: mek.key.remoteJid,
						fromMe: mek.key.fromMe,
						id: mek.key.id,
						participant: mek.key.participant
					}
				})
				console.log("[ ! ]", senderName, "Mengirim lokasi di", groupName)
			} else if (body.length > 200) {
				await Ahok.sendMessage(from, {
					delete: {
						remoteJid: mek.key.remoteJid,
						fromMe: mek.key.fromMe,
						id: mek.key.id,
						participant: mek.key.participant
					}
				})
				console.log("[ ! ]", senderName, "Mengirim pesan berlebihan di", groupName)
			} else if (body) return console.log(senderName, "Di", groupName, " Mengirim pesan:", body)
			
		} catch (err) {
			console.log("Messages Upsert ERROR => ", err)
		}
	})
	
	Ahok.ev.on("group-participants.update", async (update) => {
		const botNumber = await Ahok.decodeJid(Ahok.user.id)
		const groupMetadata = await Ahok.groupMetadata(update.id) || ""
		const groupName = groupMetadata.subject || ""
		const participants = await groupMetadata.participants || ""
		const groupAdmins = await Ahok.getGroupAdmins(participants) || ""
		const isBotAdmins = groupAdmins.includes(botNumber) || false
		const nomor = update.participants[0]
		const kickers = nomor.startsWith("62") ? true : false
		if (update.action == "add") {
			if (!isBotAdmins) return
			if (!kickers) {
				console.log("Otomatis kick -", nomor.split("@")[0], "Dari grup", groupName)
				Ahok.groupParticipantsUpdate(update.id, [nomor], "remove")
			}
		}
	})
	
	Ahok.ev.on("connection.update", async (update) => {
		const { connection, lastDisconnect } = update
		if (connection === "connecting") console.log("Menghubungkan")
		if (connection === "open") {
			console.clear()
			console.log("Berhasil")
		}
		if (connection === "close") {
			const reason = new Boom(lastDisconnect?.error)?.output.statusCode
			if (reason === baileys.DisconnectReason.badSession) {
				console.log("File Sesi Buruk Harap Hapus Sesi dan Pindai Lagi")
				Ahok.logout()
			} else if (reason === baileys.DisconnectReason.connectionClosed) {
				console.log("Koneksi ditutup")
				startBotAutoKick()
			} else if (reason === baileys.DisconnectReason.connectionLost) {
				console.log("Koneksi Hilang dari Server")
				startBotAutoKick()
			} else if (reason === baileys.DisconnectReason.connectionReplaced) {
				console.log("Koneksi Diganti, Sesi Baru Dibuka, Harap Tutup Sesi Saat Ini Terlebih Dahulu")
				Ahok.logout()
			} else if (reason === baileys.DisconnectReason.loggedOut) {
				console.log("Perangkat Keluar, Harap Pindai Lagi Dan Jalankan")
				Ahok.logout()
			} else if (reason === baileys.DisconnectReason.restartRequired) {
				console.log("Mulai Ulang Diperlukan")
				startBotAutoKick()
			} else if (reason === baileys.DisconnectReason.timedOut) {
				console.log("Waktu koneksi berakhir")
				startBotAutoKick()
			} else Ahok.end(`Alasan Putus Tidak Diketahui: ${reason} | ${connection}`)
		}
	})
	
	Ahok.decodeJid = (jid) => {
		if (!jid) return jid
		if (/:\d+@/gi.test(jid)) {
			let decode = baileys.jidDecode(jid) || {}
			return decode.user && decode.server && decode.user + "@" + decode.server || jid
		} else return jid
	}
	Ahok.getGroupAdmins = (participants) => {
		let admins = []
		for (let i of participants) {
			i.admin === "superadmin" ? admins.push(i.id) :  i.admin === "admin" ? admins.push(i.id) : ""
		}
		return admins || []
	}
	
	return Ahok
}
startBotAutoKick()
