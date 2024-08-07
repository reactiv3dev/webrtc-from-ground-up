let peerConnection;
let localStream;
let peerStream;

const configuration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun.l.google.com:5349" },
        { urls: "stun:stun1.l.google.com:3478" },
        { urls: "stun:stun1.l.google.com:5349" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:5349" },
        { urls: "stun:stun3.l.google.com:3478" },
        { urls: "stun:stun3.l.google.com:5349" },
        { urls: "stun:stun4.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:5349" }
    ],
};


/**
 * function serves to set localStream
 *  to get input from users devica and get it to browser
 */
 const init = async () => {
    // in order to share your device screen take .getDisplayMedia
    //localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    
    //for sharing input from camera use .getUserMedia
    localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: false });
 
    document.getElementById('user').srcObject = localStream; 
 };

 /**
  * @createsOffer sets localOffer if we want to start connection with someone
  * @peerConnection - new RTCPeerConnetion gets negotiated properties from STUN server
  * for establishing connection with someone outside of its own network
  * @localStream iterates over its tracks and hands them over to @peerConnection
  * @peerConnection sets event @ontrack to get tracks of stream that is incomming 
  * 
  */

 const createOffer = async () => {
    peerConnection = new RTCPeerConnection(configuration);
    peerStream = new MediaStream();

    document.getElementById('peer').srcObject = peerStream;
   
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });
    
    peerConnection.ontrack = async (event) => {
        event.streams[0].getTracks().forEach((track) => {
            peerStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = async (event) => {
        if(event.candidate){
            document.getElementById('sdp-offer').value = JSON.stringify(peerConnection.localDescription);
        }
    }

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    document.getElementById('sdp-offer').value = JSON.stringify(offer);
}

/**
 * @createAbswer answers when someon sends his @sdpOffer via websockets
 * It initiates its own @peerConnection and @peerStream
 * it recieves @remote_offer and sets it @peerConnection on which base creates @answer
 * @answer is set as @localDescription and sent back as response to @sdpOffer
 */
const createAnswer = async () => {
    peerConnection = new RTCPeerConnection(configuration);
    peerStream = new MediaStream();
    
    document.getElementById('peer').srcObject = peerStream;
   
    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });
    
    peerConnection.ontrack = async (event)=> {
        event.streams[0].getTracks().forEach((track) => {
            peerStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = async (event) => {
        if(event.candidate){
            document.getElementById('sdp-awnser').value = JSON.stringify(peerConnection.localDescription);
        }
    }

    let remote_offer = document.getElementById('sdp-offer').value
    if(!remote_offer) return alert("Retrieve offer from the peer first");

    remote_offer = JSON.parse(remote_offer);
    await peerConnection.setRemoteDescription(remote_offer);

    let answer =  await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    document.getElementById('sdp-answer').value = JSON.stringify(answer);
}

/**
 * 
 * @answer from inital peer is accepted and set as @remoteDescription
 * @connection is established
 */

const addAnswer = async () => {
    let answer = document.getElementById('sdp-answer').value
    if(!answer) return alert("Retrieve an answer to establish connection!");
    
    answer = JSON.parse(answer);
    if(!peerConnection.currentRemoteDescription){
        peerConnection.setRemoteDescription(answer)
    }
};
init();

// WrapUp frontend UI  with functionality
document.getElementById('create-offer-btn').addEventListener('click', createOffer);
document.getElementById('create-answer-btn').addEventListener('click',createAnswer);
document.getElementById('add-answer-btn').addEventListener('click',addAnswer);