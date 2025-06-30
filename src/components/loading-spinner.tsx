import styled from '@emotion/styled'

// Lovingly ripped off from https://codepen.io/catalinmortan/pen/JjVKqby

const Spinner = styled.div`
    width: 48px;
    height: 48px;
    display: block;
    margin: 15px auto;
    left: 0;
    right: 0;
    top: 35px;
    position: fixed;
    color: #ccc;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;

    ::after,
    ::before {
        content: '';
        box-sizing: border-box;
        position: absolute;
        width: 14px;
        height: 14px;
        top: 50%;
        left: 50%;
        transform: scale(0.5) translate(0, 0);
        background-color: gray;
        border-radius: 50%;
        animation: animloader 1s infinite ease-in-out;
    }

    ::before {
        background-color: gray;
        transform: scale(0.5) translate(-20px, -20px);
    }

    @keyframes rotation {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    @keyframes animloader {
        50% {
            transform: scale(1) translate(-50%, -50%);
        }
    }
`

export function LoadingSpinner() {
    return <Spinner />
}
