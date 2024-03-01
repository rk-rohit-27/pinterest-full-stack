function copyLink() {
    // Copy link to clipboard
    var copyText = document.createElement("textarea");
    copyText.value = window.location.href;
    document.body.appendChild(copyText);
    copyText.select();
    document.execCommand("copy");
    document.body.removeChild(copyText);
    alert("Link copied to clipboard");
}

function shareOnFacebook() {
    // Construct Facebook share URL with current card data and link
    var url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(window.location.href);
    window.open(url, "_blank");
}

function shareOnInstagram() {
    // Construct Instagram share URL with current card data and link
    var url = "https://www.instagram.com/share?url=" + encodeURIComponent(window.location.href);
    window.open(url, "_blank");
}

function shareOnTwitter() {
    // Construct Twitter share URL with current card data and link
    var url = "https://twitter.com/share?url=" + encodeURIComponent(window.location.href);
    window.open(url, "_blank");
}
