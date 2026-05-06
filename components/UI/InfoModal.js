import { useEffect, useState } from "react";

import { Modal } from "react-bootstrap"

import packageJson from "@/package.json"

import ArticlesButton from "./Button";
import { useStore } from "@/hooks/useStore";

export default function GameInfoModal({
    show,
    setShow,
    credits
}) {

    const [showModal, setShowModal] = useState(true)
    const darkMode = useStore((state) => state.darkMode)

    return (
        <>

            <Modal
                className="articles-modal games-info-modal"
                size='md'
                show={showModal}
                centered
                scrollable
                onExited={() => {
                    setShow(false)
                }}
                onHide={() => {
                    setShowModal(false)
                }}
            >

                <Modal.Header closeButton>
                    <Modal.Title>Game Info</Modal.Title>
                </Modal.Header>

                <Modal.Body className="flex-column p-0">

                    <div className="ratio ratio-16x9">
                        {darkMode ?
                            <img src={"img/game-preview.webp"}></img>
                            :
                            <img src={"img/game-preview.webp"}></img>
                        }
                    </div>

                    <div className="p-3">
                        {packageJson.description}
                    </div>

                </Modal.Body>

                <Modal.Footer className="justify-content-between">

                    <div></div>

                    <ArticlesButton variant="outline-dark" onClick={() => {
                        setShow(false)
                    }}>
                        Close
                    </ArticlesButton>

                </Modal.Footer>

            </Modal>
        </>
    )

}